// pages/api/admin/ukara.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const { data: applications } = await supabase
    .from('ukara_applications')
    .select('*, profiles(id,full_name,email,phone,address_line1,city,postcode,date_of_birth)')
    .order('applied_at', { ascending: false })

  // Attach game day counts
  const enriched = await Promise.all((applications || []).map(async (a) => {
    const { count } = await supabase
      .from('game_day_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', a.user_id)
      .gte('attended_date', twelveMonthsAgo.toISOString())
    return { ...a, game_day_count: count || 0 }
  }))

  res.status(200).json({ applications: enriched })
}
