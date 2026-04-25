// pages/api/admin/waivers/reject.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { sendWaiverRejected } from '../../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

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
