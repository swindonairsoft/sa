// pages/api/admin/ukara/approve.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
import { sendUkaraApproved } from '@/lib/email'
import { format } from 'date-fns'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, ukaraNumber } = req.body
  if (!id)          return res.status(400).json({ error: 'Missing application id' })
  if (!ukaraNumber) return res.status(400).json({ error: 'Missing UKARA number' })

  const supabase = getAdminClient()
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  // First fetch the application to get user_id
  const { data: existing, error: fetchErr } = await supabase
    .from('ukara_applications')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) return res.status(500).json({ error: fetchErr.message })
  if (!existing) return res.status(404).json({ error: 'Application not found' })

  // Update application status
  const { error: updateErr } = await supabase
    .from('ukara_applications')
    .update({
      status:      'approved',
      ukara_number: ukaraNumber,
      approved_at:  new Date().toISOString(),
      expires_at:   expiresAt.toISOString(),
    })
    .eq('id', id)

  if (updateErr) return res.status(500).json({ error: updateErr.message })

  // Update player profile with UKARA number
  await supabase.from('profiles').update({
    ukara_number:     ukaraNumber,
    ukara_expires_at: expiresAt.toISOString(),
  }).eq('id', existing.user_id)

  // Send email notification
  const { data: profile } = await supabase
    .from('profiles').select('full_name,email').eq('id', existing.user_id).maybeSingle()

  if (profile?.email) {
    try {
      await sendUkaraApproved({
        to:          profile.email,
        playerName:  profile.full_name,
        ukaraNumber,
        expiresAt:   format(expiresAt, 'd MMMM yyyy'),
      })
    } catch (e) {
      console.error('UKARA email failed:', e)
    }
  }

  res.status(200).json({ ok: true })
}
