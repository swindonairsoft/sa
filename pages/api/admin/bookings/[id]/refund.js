// pages/api/admin/bookings/[id]/refund.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createRefund } from '../../../../../lib/stripe'
import { sendRefundNotification } from '../../../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const { reason = '' } = req.body

  // Get booking with payment intent
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, events(title,event_date), profiles(full_name,email)')
    .eq('id', id)
    .single()

  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  if (booking.status === 'refunded') return res.status(400).json({ error: 'Already refunded' })

  // Process Stripe refund
  if (booking.stripe_payment_intent) {
    try {
      await createRefund(booking.stripe_payment_intent)
    } catch (stripeErr) {
      console.error('Stripe refund error:', stripeErr)
      return res.status(500).json({ error: 'Stripe refund failed: ' + stripeErr.message })
    }
  }

  // Update booking status
  await supabase.from('bookings').update({
    status: 'refunded',
    cancellation_reason: reason,
    cancelled_at: new Date().toISOString(),
  }).eq('id', id)

  // Send email notification
  try {
    await sendRefundNotification({
      to: booking.profiles.email,
      playerName: booking.profiles.full_name,
      eventTitle: booking.events?.title || 'Event',
      bookingRef: booking.booking_ref,
      amount: booking.amount_paid,
    })
  } catch {}

  res.status(200).json({ ok: true })
}
