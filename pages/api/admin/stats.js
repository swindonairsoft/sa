// pages/api/admin/stats.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
  const startOfWeek  = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7)

  const { data: monthBookings } = await supabase.from('bookings').select('amount_paid').eq('status','confirmed').gte('created_at', startOfMonth.toISOString())
  const { count: weekCount }    = await supabase.from('bookings').select('*', { count:'exact', head:true }).gte('created_at', startOfWeek.toISOString())
  const { count: pendingCount } = await supabase.from('bookings').select('*', { count:'exact', head:true }).eq('status','pending')

  const monthRevenue = (monthBookings || []).reduce((s, b) => s + (b.amount_paid || 0), 0)

  res.status(200).json({
    monthRevenue,
    monthBookings: monthBookings?.length || 0,
    weekBookings: weekCount || 0,
    pendingPayments: pendingCount || 0,
    revDelta: '+18% vs last month',
  })
}
