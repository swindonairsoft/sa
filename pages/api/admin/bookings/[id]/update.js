// pages/api/admin/bookings/[id]/update.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const { event_id, package_type, player_count, status } = req.body

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ event_id, package_type, player_count, status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, events(id,title,event_date), profiles(id,full_name,email)')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ booking })
}
