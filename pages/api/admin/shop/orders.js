import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!await isAdminUser(session.user.id)) return res.status(403).json({ error: 'Forbidden' })
  const supabase = getAdminClient()
  const { data } = await supabase.from('shop_orders').select('*, profiles(full_name,email)').order('created_at', { ascending: false })
  res.status(200).json({ orders: data || [] })
}
