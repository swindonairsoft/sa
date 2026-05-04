// pages/api/shop/orders.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = getAdminClient()
  const { data: orders } = await supabase
    .from('shop_orders')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  res.status(200).json({ orders: orders || [] })
}
