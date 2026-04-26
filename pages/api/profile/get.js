// pages/api/profile/get.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const admin = getAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  res.status(200).json({ profile: profile || null })
}
