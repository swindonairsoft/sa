// pages/api/admin/profile-edits/pending.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getAdminClient()

  // Get pending edits with profile data (for "before" values)
  const { data: edits } = await supabase
    .from('pending_profile_edits')
    .select('*, profiles(full_name, email, phone, date_of_birth, address_line1, address_line2, city, postcode)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  res.status(200).json({ edits: edits || [] })
}
