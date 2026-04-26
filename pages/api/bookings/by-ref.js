// pages/api/bookings/by-ref.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { ref } = req.query
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, events(id,title,event_date,start_time,end_time,location)')
    .eq('booking_ref', ref)
    .eq('user_id', session.user.id)
    .single()

  res.status(200).json({ booking: booking || null })
}
