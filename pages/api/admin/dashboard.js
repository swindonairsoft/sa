// pages/api/admin/dashboard.js - single call returns all dashboard data
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getAdminClient()
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
  const startOfWeek  = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7)

  const [
    { data: monthBookings },
    { count: weekCount },
    { count: pendingCount },
    { data: allBookings },
    { data: events },
    { data: newWaivers },
    { data: editWaivers },
    { data: pendingEdits },
    { data: ukaraApps },
    { data: shopOrders },
  ] = await Promise.all([
    supabase.from('bookings').select('amount_paid,package_type').eq('status','confirmed').gte('created_at', startOfMonth.toISOString()),
    supabase.from('bookings').select('*', { count:'exact', head:true }).gte('created_at', startOfWeek.toISOString()),
    supabase.from('bookings').select('*', { count:'exact', head:true }).eq('status','pending'),
    supabase.from('bookings').select('*, events(id,title,event_date), profiles(id,full_name,email)').order('created_at', { ascending: false }).limit(100),
    supabase.from('events').select('*').order('event_date', { ascending: true }),
    supabase.from('waivers').select('*, profiles(full_name,email)').eq('status','pending_approval').order('submitted_at', { ascending: true }),
    supabase.from('pending_waiver_edits').select('*, profiles(full_name,email)').eq('status','pending').order('submitted_at', { ascending: true }),
    supabase.from('pending_profile_edits').select('id').eq('status','pending'),
    supabase.from('ukara_applications').select('id').eq('status','pending_review'),
    supabase.from('shop_orders').select('id,status').in('status',['paid','processing']),
  ])

  const monthRevenue = (monthBookings||[]).reduce((s,b) => s+(b.amount_paid||0), 0)
  const walkonRev    = (monthBookings||[]).filter(b=>b.package_type==='walkon').reduce((s,b) => s+(b.amount_paid||0), 0)
  const hireRev      = (monthBookings||[]).filter(b=>b.package_type==='hire').reduce((s,b) => s+(b.amount_paid||0), 0)

  res.status(200).json({
    stats: {
      monthRevenue,
      monthBookings: monthBookings?.length || 0,
      weekBookings:  weekCount  || 0,
      pendingPayments: pendingCount || 0,
      walkonPct: monthRevenue > 0 ? Math.round((walkonRev/monthRevenue)*100) : 65,
      hirePct:   monthRevenue > 0 ? Math.round((hireRev/monthRevenue)*100)  : 35,
    },
    bookings:    allBookings || [],
    events:      events      || [],
    waiverQueue: { new: newWaivers||[], edits: editWaivers||[] },
    badges: {
      waivers:      (newWaivers?.length||0) + (editWaivers?.length||0),
      profileEdits: pendingEdits?.length  || 0,
      ukara:        ukaraApps?.length     || 0,
      orders:       shopOrders?.length    || 0,
    },
  })
}
