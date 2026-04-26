// pages/api/admin/ukara/reject.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, reason = '' } = req.body
  const { error } = await supabase.from('ukara_applications').update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() }).eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true })
}
