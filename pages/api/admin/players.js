// pages/api/admin/players.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getAdminClient()
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  // Fetch profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  // For each profile, get their waiver and game day count separately
  // (Supabase foreign key join on auth.users-linked tables can be unreliable)
  const players = await Promise.all((profiles || []).map(async (p) => {
    // Get waiver
    const { data: waiver } = await supabase
      .from('waivers')
      .select('id, status, signed_at, approved_at')
      .eq('user_id', p.id)
      .maybeSingle()

    // Get game day count
    const { count: gameDayCount } = await supabase
      .from('game_day_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', p.id)
      .gte('attended_date', twelveMonthsAgo.toISOString())

    return {
      ...p,
      waivers: waiver ? [waiver] : [],
      game_day_count: gameDayCount || 0,
    }
  }))

  res.status(200).json({ players })
}
