import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!await isAdminUser(session.user.id)) return res.status(403).json({ error: 'Forbidden' })
  const supabase = getAdminClient()
  const { name, slug, description, category_id, price, compare_price, stock, images, variants, requires_ukara, is_active } = req.body
  const { data, error } = await supabase.from('shop_products').insert({ name, slug, description, category_id: category_id || null, price, compare_price: compare_price || null, stock: Number(stock) || 0, images: images || [], variants: variants || [], requires_ukara: !!requires_ukara, is_active: !!is_active }).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ product: data })
}
