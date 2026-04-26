// pages/api/waiver/submit.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
import { sendWaiverApproved } from '@/lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const payload = {
    user_id: session.user.id,
    sections_agreed: req.body.sections_agreed,
    text_values: req.body.text_values,
    date_of_birth: req.body.date_of_birth,
    is_under18: req.body.is_under18,
    parent_data: req.body.parent_data,
    esign_name: req.body.esign_name,
    esign_date: req.body.esign_date,
    signed_at: req.body.signed_at,
    status: 'pending_approval',
    submitted_at: new Date().toISOString(),
  }

  // Check if existing waiver
  const { data: existing } = await supabase.from('waivers').select('id').eq('user_id', session.user.id).maybeSingle()

  if (existing) {
    // Insert edit for admin review
    await supabase.from('pending_waiver_edits').upsert({ ...payload, waiver_id: existing.id, status: 'pending' })
  } else {
    // New waiver
    const { error } = await supabase.from('waivers').insert(payload)
    if (error) return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ ok: true })
}
