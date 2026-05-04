import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!await isAdminUser(session.user.id)) return res.status(403).json({ error: 'Forbidden' })
  const { id } = req.query
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('shop_orders').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ order: data })
}
