// pages/api/admin/waivers/[id].js
// Returns a specific waiver or pending_waiver_edit by ID for admin review
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id, type } = req.query
  const supabase = getAdminClient()

  let waiver = null
  let player = null

  if (type === 'edit') {
    // Fetch from pending_waiver_edits
    const { data } = await supabase
      .from('pending_waiver_edits')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    waiver = data

    if (data?.user_id) {
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.user_id)
        .maybeSingle()
      player = p
    }
  } else {
    // Fetch from waivers table
    const { data } = await supabase
      .from('waivers')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    waiver = data

    if (data?.user_id) {
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.user_id)
        .maybeSingle()
      player = p
    }
  }

  res.status(200).json({ waiver: waiver || null, player: player || null })
}
