// pages/api/admin/waivers/approve.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
import { sendWaiverApproved } from '@/lib/email'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, isEdit } = req.body
  if (isEdit) {
    const { data: edit } = await supabase.from('pending_waiver_edits').select('*').eq('id', id).single()
    if (edit) {
      const { user_id, waiver_id, id: _id, submitted_at, status, reviewed_at, ...fields } = edit
      await supabase.from('waivers').update({ ...fields, status: 'approved', approved_at: new Date().toISOString() }).eq('id', waiver_id)
      await supabase.from('pending_waiver_edits').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', id)
    }
  } else {
    const { data: waiver } = await supabase.from('waivers').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id).select('*, profiles(full_name,email)').single()
    if (waiver?.profiles) {
      try { await sendWaiverApproved({ to: waiver.profiles.email, playerName: waiver.profiles.full_name }) } catch {}
    }
  }
  res.status(200).json({ ok: true })
}
