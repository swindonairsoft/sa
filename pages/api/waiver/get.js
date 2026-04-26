// pages/api/waiver/get.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { data: waiver } = await supabase
    .from('waivers')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  res.status(200).json({ waiver: waiver || null })
}
