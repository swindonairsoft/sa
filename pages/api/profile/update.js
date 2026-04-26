// pages/api/profile/update.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { full_name, phone, date_of_birth, address_line1, address_line2, city, postcode } = req.body
  const { error } = await supabase.from('pending_profile_edits').upsert({
    user_id: session.user.id, full_name, phone, date_of_birth, address_line1, address_line2, city, postcode,
    status: 'pending', submitted_at: new Date().toISOString(),
  })
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true, message: 'Changes submitted for admin approval.' })
}
