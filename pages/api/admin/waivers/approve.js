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
  if (!id) return res.status(400).json({ error: 'Missing id' })

  const supabase = getAdminClient()

  if (isEdit) {
    // Fetch the pending edit record
    const { data: edit, error: fetchErr } = await supabase
      .from('pending_waiver_edits')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr) return res.status(500).json({ error: fetchErr.message })
    if (!edit) return res.status(404).json({ error: 'Edit not found' })

    // Destructure out non-waiver fields
    const {
      id: _editId, user_id, waiver_id, status, submitted_at, reviewed_at,
      ...waiverFields
    } = edit

    // Apply to live waiver
    const { error: updateErr } = await supabase
      .from('waivers')
      .update({
        ...waiverFields,
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', waiver_id)

    if (updateErr) return res.status(500).json({ error: updateErr.message })

    // Mark the edit as approved
    await supabase
      .from('pending_waiver_edits')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', id)

  } else {
    // Direct waiver approval — update by waiver id
    const { data: waiver, error: updateErr } = await supabase
      .from('waivers')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, user_id')
      .maybeSingle()

    if (updateErr) return res.status(500).json({ error: updateErr.message })
    if (!waiver) return res.status(404).json({ error: 'Waiver not found' })

    // Send approval email
    if (waiver.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', waiver.user_id)
        .maybeSingle()
      if (profile?.email) {
        try {
          await sendWaiverApproved({ to: profile.email, playerName: profile.full_name })
        } catch (emailErr) {
          console.error('Email send failed:', emailErr)
        }
      }
    }
  }

  res.status(200).json({ ok: true })
}
