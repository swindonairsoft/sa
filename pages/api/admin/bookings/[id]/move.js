// pages/api/admin/bookings/[id]/move.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../../../lib/supabase'
import { sendBookingConfirmation } from '../../../../../lib/email'
import { format } from 'date-fns'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const { newEventId } = req.body

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ event_id: newEventId, moved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, events(id,title,event_date,start_time,end_time), profiles(full_name,email)')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Send updated confirmation email
  try {
    await sendBookingConfirmation({
      to: booking.profiles.email,
      playerName: booking.profiles.full_name,
      eventTitle: booking.events.title,
      eventDate: format(new Date(booking.events.event_date), 'EEEE d MMMM yyyy') + ` · ${booking.events.start_time}–${booking.events.end_time}`,
      bookingRef: booking.booking_ref,
      players: booking.player_count,
      packageType: booking.package_type,
      amountPaid: booking.amount_paid,
      ticketUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/ticket/${booking.booking_ref}`,
    })
  } catch (emailErr) {
    console.error('Email error:', emailErr)
  }

  res.status(200).json({ booking })
}
