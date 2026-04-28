// pages/api/admin/events/[id]/update.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })
  const { id } = req.query
  const updates = { ...req.body }
  if (updates.capacity)     updates.capacity     = Number(updates.capacity)
  if (updates.price_walkon) updates.price_walkon = Number(updates.price_walkon)
  if (updates.price_hire)   updates.price_hire   = Number(updates.price_hire)
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ event: data })
}
