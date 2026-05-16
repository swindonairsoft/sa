// pages/api/admin/waivers/all.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!await isAdminUser(session.user.id)) return res.status(403).json({ error: 'Forbidden' })
  const supabase = getAdminClient()
  const { data } = await supabase.from('waivers').select('*, profiles(full_name,email)').order('submitted_at', { ascending: false })
  res.status(200).json({ waivers: data||[] })
}
