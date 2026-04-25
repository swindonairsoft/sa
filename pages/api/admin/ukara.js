// pages/api/admin/ukara.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

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
