// pages/api/profile/gamedays.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const twelveMonthsAgo = new Date(); twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
  const { count } = await supabase.from('game_day_log').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).gte('attended_date', twelveMonthsAgo.toISOString())
  res.status(200).json({ count: count || 0 })
}
