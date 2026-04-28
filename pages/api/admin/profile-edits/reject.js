// pages/api/admin/profile-edits/reject.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.body
  const supabase = getAdminClient()
  await supabase
    .from('pending_profile_edits')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', id)

  res.status(200).json({ ok: true })
}
