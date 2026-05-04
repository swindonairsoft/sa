// pages/api/shop/order.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { ref } = req.query
  const supabase = getAdminClient()

  const { data: order } = await supabase
    .from('shop_orders')
    .select('*')
    .eq('order_ref', ref)
    .eq('user_id', session.user.id)
    .maybeSingle()

  res.status(200).json({ order: order || null })
}
