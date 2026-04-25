// pages/api/webhooks/stripe.js
import { buffer } from 'micro'
import { constructWebhookEvent } from '../../../lib/stripe'
import { getAdminClient } from '../../../lib/supabase'
import { sendBookingConfirmation, sendUkaraConfirmation } from '../../../lib/email'
import { format } from 'date-fns'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    event = constructWebhookEvent(buf, sig)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const supabase = getAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { booking_id, application_id, type } = session.metadata || {}

    if (type === 'booking' && booking_id) {
      // Confirm booking
      const { data: booking } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_payment_intent: session.payment_intent,
          stripe_session_id: session.id,
        })
        .eq('id', booking_id)
        .select('*, events(title,event_date,start_time,end_time), profiles(full_name,email)')
        .single()

      if (booking) {
        // Log game day attendance
        await supabase.from('game_day_log').insert({
          user_id: booking.user_id,
          event_id: booking.event_id,
          attended_date: booking.events.event_date,
        })

        // Send confirmation email
        try {
          await sendBookingConfirmation({
            to: booking.profiles.email,
            playerName: booking.profiles.full_name,
            eventTitle: booking.events.title,
            eventDate: format(new Date(booking.events.event_date), 'EEEE d MMMM yyyy') +
              ` · ${booking.events.start_time}–${booking.events.end_time}`,
            bookingRef: booking.booking_ref,
            players: booking.player_count,
            packageType: booking.package_type === 'hire' ? 'Hire Package (unlimited BBs)' : 'Walk-on',
            amountPaid: booking.amount_paid,
            ticketUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/ticket/${booking.booking_ref}`,
          })
        } catch (emailErr) {
          console.error('Booking confirmation email failed:', emailErr)
        }
      }
    }

    if (type === 'ukara' && application_id) {
      // Mark UKARA as pending review (admin still needs to approve + assign number)
      const { data: application } = await supabase
        .from('ukara_applications')
        .update({
          status: 'pending_review',
          stripe_payment_intent: session.payment_intent,
          stripe_session_id: session.id,
        })
        .eq('id', application_id)
        .select('*, profiles(full_name,email)')
        .single()

      if (application?.profiles) {
        try {
          await sendUkaraConfirmation({
            to: application.profiles.email,
            playerName: application.profiles.full_name,
            applicationId: application.id,
          })
        } catch {}
      }
    }
  }

  res.status(200).json({ received: true })
}
