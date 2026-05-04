import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!await isAdminUser(session.user.id)) return res.status(403).json({ error: 'Forbidden' })
  const supabase = getAdminClient()
  const { data } = await supabase.from('shop_products').select('*, shop_categories(id,name,slug)').order('created_at', { ascending: false })
  res.status(200).json({ products: data || [] })
}
