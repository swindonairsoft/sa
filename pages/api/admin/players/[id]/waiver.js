// pages/api/admin/players/[id]/waiver.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })
  const { id } = req.query
  const supabase = getAdminClient()
  const { data: waiver } = await supabase.from('waivers').select('*').eq('user_id', id).maybeSingle()
  res.status(200).json({ waiver: waiver || null })
}
