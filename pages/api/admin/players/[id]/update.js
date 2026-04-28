// pages/api/admin/players/[id]/update.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })
  const { id } = req.query
  const { full_name, email, phone, date_of_birth, address_line1, address_line2, city, postcode, ukara_number, ukara_expires_at } = req.body
  const supabase = getAdminClient()
  const { error } = await supabase.from('profiles').update({
    full_name, email, phone, date_of_birth: date_of_birth || null,
    address_line1, address_line2, city, postcode,
    ukara_number: ukara_number || null,
    ukara_expires_at: ukara_expires_at ? new Date(ukara_expires_at).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true })
}
