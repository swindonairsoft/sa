// pages/api/admin/bookings.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })
  const { data: bookings } = await supabase.from('bookings').select('*, events(id,title,event_date), profiles(id,full_name,email,phone)').order('created_at', { ascending: false })
  res.status(200).json({ bookings: bookings || [] })
}
