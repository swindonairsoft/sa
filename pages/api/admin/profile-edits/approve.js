// pages/api/admin/profile-edits/approve.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.body
  const supabase = getAdminClient()

  const { data: edit, error: fetchErr } = await supabase
    .from('pending_profile_edits')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchErr || !edit) return res.status(404).json({ error: 'Edit not found' })

  const { user_id, id: _id, status, submitted_at, reviewed_at, ...profileFields } = edit

  const { error } = await supabase
    .from('profiles')
    .update({ ...profileFields, updated_at: new Date().toISOString() })
    .eq('id', user_id)
  if (error) return res.status(500).json({ error: error.message })

  await supabase
    .from('pending_profile_edits')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', id)

  res.status(200).json({ ok: true })
}
