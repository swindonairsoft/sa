// pages/api/admin/waivers/approve.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
import { sendWaiverApproved } from '@/lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, isEdit } = req.body
  const supabase = getAdminClient()

  if (isEdit) {
    // Get the edit
    const { data: edit, error: fetchErr } = await supabase
      .from('pending_waiver_edits').select('*').eq('id', id).single()
    if (fetchErr || !edit) return res.status(404).json({ error: 'Edit not found' })

    const { user_id, waiver_id, id: _id, submitted_at, status, reviewed_at, ...fields } = edit

    // Apply fields to live waiver
    await supabase.from('waivers').update({
      ...fields, status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', waiver_id)

    // Mark edit as approved
    await supabase.from('pending_waiver_edits').update({
      status: 'approved', reviewed_at: new Date().toISOString(),
    }).eq('id', id)
  } else {
    // Direct waiver approval
    const { data: waiver } = await supabase
      .from('waivers').update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id).select('user_id').single()

    // Notify player
    if (waiver?.user_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name,email').eq('id', waiver.user_id).single()
      if (profile) {
        try { await sendWaiverApproved({ to: profile.email, playerName: profile.full_name }) } catch {}
      }
    }
  }

  res.status(200).json({ ok: true })
}
