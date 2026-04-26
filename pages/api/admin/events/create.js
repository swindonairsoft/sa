// pages/api/admin/events/create.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { title, description, event_date, start_time, end_time, location, event_type, capacity, price_walkon, price_hire, is_active } = req.body
  const { data, error } = await supabase.from('events').insert({
    title, description, event_date, start_time, end_time, location, event_type,
    capacity: Number(capacity), price_walkon: Number(price_walkon), price_hire: Number(price_hire), is_active,
  }).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ event: data })
}
