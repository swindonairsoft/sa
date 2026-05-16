// pages/api/admin/badges.js - lightweight badge counts, single call
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(200).json({ waivers:0, profileEdits:0, ukara:0, orders:0 })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(200).json({ waivers:0, profileEdits:0, ukara:0, orders:0 })

  const supabase = getAdminClient()
  const [
    { count: newW },
    { count: editW },
    { count: profileEdits },
    { count: ukara },
    { count: orders },
  ] = await Promise.all([
    supabase.from('waivers').select('*', { count:'exact', head:true }).eq('status','pending_approval'),
    supabase.from('pending_waiver_edits').select('*', { count:'exact', head:true }).eq('status','pending'),
    supabase.from('pending_profile_edits').select('*', { count:'exact', head:true }).eq('status','pending'),
    supabase.from('ukara_applications').select('*', { count:'exact', head:true }).eq('status','pending_review'),
    supabase.from('shop_orders').select('*', { count:'exact', head:true }).in('status',['paid','processing']),
  ])
  res.status(200).json({ waivers:(newW||0)+(editW||0), profileEdits:profileEdits||0, ukara:ukara||0, orders:orders||0 })
}
