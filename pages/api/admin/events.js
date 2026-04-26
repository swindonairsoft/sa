// pages/api/admin/events.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })
  const { data: events } = await supabase.from('events').select('*').order('event_date', { ascending: true })
  res.status(200).json({ events: events || [] })
}
