// pages/api/ukara/eligibility.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const twelveMonthsAgo = new Date(); twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
  const { count: gameDays } = await supabase.from('game_day_log').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).gte('attended_date', twelveMonthsAgo.toISOString())
  const { data: waiver } = await supabase.from('waivers').select('status').eq('user_id', session.user.id).maybeSingle()
  const days = gameDays || 0
  res.status(200).json({ eligible: days >= 3, gameDays: days, required: 3, shortfall: Math.max(0, 3 - days), waiverOk: waiver?.status === 'approved' })
}
