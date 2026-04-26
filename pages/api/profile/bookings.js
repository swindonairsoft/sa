// pages/api/profile/bookings.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: bookings } = await supabase.from('bookings').select('*, events(id,title,event_date,event_type,location)').eq('user_id', session.user.id).order('created_at', { ascending: false })
  res.status(200).json({ bookings: bookings || [] })
}
