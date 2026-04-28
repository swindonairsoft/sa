// pages/api/admin/players/[id]/additional-waivers.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })
  const { id } = req.query
  const supabase = getAdminClient()
  if (req.method === 'GET') {
    const { data } = await supabase.from('additional_waivers').select('*').eq('primary_user_id', id).order('created_at', { ascending: false })
    return res.status(200).json({ waivers: data || [] })
  }
  if (req.method === 'POST') {
    const { full_name, date_of_birth, relationship } = req.body
    if (!full_name || !date_of_birth) return res.status(400).json({ error: 'Name and DOB required' })
    const { data, error } = await supabase.from('additional_waivers').insert({ primary_user_id: id, full_name, date_of_birth, relationship, created_at: new Date().toISOString() }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, waiver: data })
  }
  res.status(405).end()
}
