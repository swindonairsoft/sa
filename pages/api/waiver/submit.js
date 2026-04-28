// pages/api/waiver/submit.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const admin = getAdminClient()
  const payload = {
    user_id:         session.user.id,
    sections_agreed: req.body.sections_agreed || {},
    text_values:     req.body.text_values     || {},
    date_of_birth:   req.body.date_of_birth   || null,
    is_under18:      req.body.is_under18      || false,
    parent_data:     req.body.parent_data     || null,
    esign_name:      req.body.esign_name      || '',
    esign_date:      req.body.esign_date      || '',
    signed_at:       req.body.signed_at       || new Date().toISOString(),
    updated_at:      new Date().toISOString(),
  }

  // Check if existing waiver
  const { data: existing } = await admin
    .from('waivers').select('id').eq('user_id', session.user.id).maybeSingle()

  if (existing) {
    // Edits go to pending queue for admin approval
    const { error } = await admin.from('pending_waiver_edits').upsert({
      ...payload, waiver_id: existing.id, status: 'pending',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (error) return res.status(500).json({ error: error.message })
    res.status(200).json({ ok: true, message: 'Edit submitted for admin approval.' })
  } else {
    // First-time waiver — auto-approved immediately, no admin approval needed
    const { error } = await admin.from('waivers').insert({
      ...payload,
      status:      'approved',
      approved_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    })
    if (error) return res.status(500).json({ error: error.message })
    res.status(200).json({ ok: true, message: 'Waiver signed and approved.' })
  }
}
