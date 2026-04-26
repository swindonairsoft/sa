// pages/api/waiver/get.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const admin = getAdminClient()
  const { data: waiver } = await admin
    .from('waivers')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  res.status(200).json({ waiver: waiver || null })
}
