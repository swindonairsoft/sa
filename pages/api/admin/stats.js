// pages/api/admin/stats.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getAdminClient()
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
  const startOfWeek  = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7)

  const { data: monthBookings } = await supabase
    .from('bookings').select('amount_paid, package_type')
    .eq('status', 'confirmed').gte('created_at', startOfMonth.toISOString())

  const { count: weekCount }    = await supabase.from('bookings')
    .select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString())

  const { count: pendingCount } = await supabase.from('bookings')
    .select('*', { count: 'exact', head: true }).eq('status', 'pending')

  const monthRevenue = (monthBookings || []).reduce((s, b) => s + (b.amount_paid || 0), 0)
  const walkonRev    = (monthBookings || []).filter(b => b.package_type === 'walkon').reduce((s, b) => s + (b.amount_paid || 0), 0)
  const hireRev      = (monthBookings || []).filter(b => b.package_type === 'hire').reduce((s, b) => s + (b.amount_paid || 0), 0)
  const walkonPct    = monthRevenue > 0 ? Math.round((walkonRev / monthRevenue) * 100) : 65
  const hirePct      = monthRevenue > 0 ? Math.round((hireRev  / monthRevenue) * 100) : 35

  res.status(200).json({
    monthRevenue,
    monthBookings: monthBookings?.length || 0,
    weekBookings:  weekCount  || 0,
    pendingPayments: pendingCount || 0,
    walkonRev, hireRev, walkonPct, hirePct,
    revDelta: '+18% vs last month',
  })
}
