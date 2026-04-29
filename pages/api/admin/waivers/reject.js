// pages/api/admin/waivers/reject.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
import { sendWaiverRejected } from '@/lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, isEdit, reason = '' } = req.body
  if (!id) return res.status(400).json({ error: 'Missing id' })

  const supabase = getAdminClient()
  const table = isEdit ? 'pending_waiver_edits' : 'waivers'

  const { data, error } = await supabase
    .from(table)
    .update({
      status: 'rejected',
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('user_id')
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })

  // Send rejection email
  if (data?.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', data.user_id)
      .maybeSingle()
    if (profile?.email) {
      try {
        await sendWaiverRejected({ to: profile.email, playerName: profile.full_name, reason })
      } catch {}
    }
  }

  res.status(200).json({ ok: true })
}
