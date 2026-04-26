// pages/api/profile/get.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  res.status(200).json({ profile: profile || null })
}
