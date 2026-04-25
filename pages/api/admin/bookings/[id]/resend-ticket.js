// pages/api/admin/bookings/[id]/resend-ticket.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { resendTicket } from '../../../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, events(title,event_date), profiles(full_name,email)')
    .eq('id', id)
    .single()

  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  try {
    await resendTicket({
      to: booking.profiles.email,
      playerName: booking.profiles.full_name,
      eventTitle: booking.events?.title || 'Event',
      bookingRef: booking.booking_ref,
      ticketUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/ticket/${booking.booking_ref}`,
    })
  } catch (e) {
    return res.status(500).json({ error: 'Email failed: ' + e.message })
  }

  res.status(200).json({ ok: true })
}
