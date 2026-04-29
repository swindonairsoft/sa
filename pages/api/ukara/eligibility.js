// pages/api/ukara/eligibility.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = getAdminClient()
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  // Game days
  const { count: gameDays } = await supabase
    .from('game_day_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .gte('attended_date', twelveMonthsAgo.toISOString())

  // Waiver status
  const { data: waiver } = await supabase
    .from('waivers')
    .select('status')
    .eq('user_id', session.user.id)
    .maybeSingle()

  // Profile completeness
  const { data: profile } = await supabase
    .from('profiles')
    .select('address_line1, phone')
    .eq('id', session.user.id)
    .maybeSingle()

  const days = gameDays || 0

  res.status(200).json({
    eligible:   days >= 3 && waiver?.status === 'approved',
    gameDays:   days,
    required:   3,
    shortfall:  Math.max(0, 3 - days),
    waiverOk:   waiver?.status === 'approved',
    profileOk:  !!(profile?.address_line1 && profile?.phone),
  })
}
