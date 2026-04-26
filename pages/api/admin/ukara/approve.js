// pages/api/admin/ukara/approve.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
import { sendUkaraApproved } from '@/lib/email'
import { format } from 'date-fns'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, ukaraNumber } = req.body

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { data: application, error } = await supabase
    .from('ukara_applications')
    .update({ status: 'approved', ukara_number: ukaraNumber, approved_at: new Date().toISOString(), expires_at: expiresAt.toISOString() })
    .eq('id', id)
    .select('*, profiles(full_name,email)')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Update profile with UKARA number
  await supabase.from('profiles').update({ ukara_number: ukaraNumber, ukara_expires_at: expiresAt.toISOString() }).eq('id', application.user_id)

  // Send email
  try {
    await sendUkaraApproved({
      to: application.profiles.email,
      playerName: application.profiles.full_name,
      ukaraNumber,
      expiresAt: format(expiresAt, 'd MMMM yyyy'),
    })
  } catch {}

  res.status(200).json({ ok: true })
}
