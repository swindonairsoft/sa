// pages/api/admin/players.js - bulk queries, no N+1
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!await isAdminUser(session.user.id)) return res.status(403).json({ error: 'Forbidden' })
  const supabase = getAdminClient()
  const twelveMonthsAgo = new Date(); twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear()-1)
  const [{ data: profiles }, { data: waivers }, { data: gameDays }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('waivers').select('id,user_id,status,signed_at,approved_at'),
    supabase.from('game_day_log').select('user_id').gte('attended_date', twelveMonthsAgo.toISOString()),
  ])
  const waiverMap  = Object.fromEntries((waivers||[]).map(w => [w.user_id, w]))
  const gameDayMap = (gameDays||[]).reduce((acc,g) => { acc[g.user_id]=(acc[g.user_id]||0)+1; return acc }, {})
  const players = (profiles||[]).map(p => ({ ...p, waivers: waiverMap[p.id]?[waiverMap[p.id]]:[], game_day_count: gameDayMap[p.id]||0 }))
  res.status(200).json({ players })
}
