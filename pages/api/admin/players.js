// pages/api/admin/players.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, waivers(id,status,signed_at)')
    .order('created_at', { ascending: false })

  // Attach game day counts
  const players = await Promise.all((profiles || []).map(async (p) => {
    const { count } = await supabase
      .from('game_day_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', p.id)
      .gte('attended_date', twelveMonthsAgo.toISOString())
    return { ...p, game_day_count: count || 0 }
  }))

  res.status(200).json({ players })
}
