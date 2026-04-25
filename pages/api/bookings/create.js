// pages/api/bookings/create.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createBookingCheckout } from '../../../lib/stripe'
import { format } from 'date-fns'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { eventId, pkg, players, addons = [] } = req.body

  // Check waiver
  const { data: waiver } = await supabase.from('waivers').select('status').eq('user_id', session.user.id).maybeSingle()
  if (!waiver || waiver.status !== 'approved') return res.status(400).json({ error: 'You must have an approved waiver before booking.' })

  // Get event
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (!event) return res.status(404).json({ error: 'Event not found' })

  // Check capacity
  const { count: booked } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('event_id', eventId).neq('status', 'cancelled')
  if ((booked || 0) + players > event.capacity) return res.status(400).json({ error: 'Not enough spots remaining.' })

  // Check U18 pyro restriction
  const { data: profile } = await supabase.from('profiles').select('date_of_birth').eq('id', session.user.id).single()
  if (addons.includes('pyro') && profile?.date_of_birth) {
    const age = Math.floor((Date.now() - new Date(profile.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) return res.status(400).json({ error: 'Under-18 players cannot add pyro (UK Fireworks Regulations 2004).' })
  }

  // Calculate price
  const unitPrice = pkg === 'hire' ? event.price_hire : event.price_walkon
  const ADDON_PRICES = { pyro: 1000, ammo: 500 }
  const addonTotal = addons.reduce((s, a) => s + (ADDON_PRICES[a] || 0), 0)
  const totalPence = (unitPrice * players) + (addonTotal * players)

  // Create pending booking
  const { data: booking, error } = await supabase.from('bookings').insert({
    user_id: session.user.id,
    event_id: eventId,
    package_type: pkg,
    player_count: players,
    addons: addons,
    amount_paid: totalPence,
    status: 'pending',
  }).select().single()
  if (error) return res.status(500).json({ error: error.message })

  // Get player email
  const { data: playerProfile } = await supabase.from('profiles').select('email').eq('id', session.user.id).single()

  // Create Stripe checkout
  const checkoutSession = await createBookingCheckout({
    bookingId: booking.id,
    eventTitle: event.title,
    eventDate: format(new Date(event.event_date), 'EEE d MMM yyyy'),
    players,
    packageType: pkg === 'hire' ? 'Hire Package (unlimited BBs)' : 'Walk-on',
    amountPence: totalPence,
    customerEmail: playerProfile?.email || session.user.email,
    successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?ref=${booking.booking_ref}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${eventId}?cancelled=1`,
  })

  // Save stripe session id
  await supabase.from('bookings').update({ stripe_session_id: checkoutSession.id }).eq('id', booking.id)

  res.status(200).json({ checkoutUrl: checkoutSession.url })
}
