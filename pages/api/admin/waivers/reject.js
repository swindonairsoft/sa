// pages/api/admin/waivers/reject.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
import { sendWaiverRejected } from '@/lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, isEdit, reason = '' } = req.body
  const table = isEdit ? 'pending_waiver_edits' : 'waivers'

  const { data: item } = await supabase.from(table).update({
    status: isEdit ? 'rejected' : 'rejected',
    rejection_reason: reason,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id).select('*, profiles(full_name,email)').single()

  if (item?.profiles) {
    try { await sendWaiverRejected({ to: item.profiles.email, playerName: item.profiles.full_name, reason }) } catch {}
  }

  res.status(200).json({ ok: true })
}
