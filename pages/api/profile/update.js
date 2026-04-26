// pages/api/profile/update.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { full_name, phone, date_of_birth, address_line1, address_line2, city, postcode } = req.body

  const admin = getAdminClient()

  // Write to pending edits table — admin must approve
  const { error } = await admin.from('pending_profile_edits').upsert({
    user_id: session.user.id,
    full_name, phone, date_of_birth, address_line1, address_line2, city, postcode,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true, message: 'Changes submitted for admin approval.' })
}
