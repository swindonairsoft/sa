// pages/api/admin/events/[id]/update.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const updates = { ...req.body }
  if (updates.capacity)     updates.capacity     = Number(updates.capacity)
  if (updates.price_walkon) updates.price_walkon = Number(updates.price_walkon)
  if (updates.price_hire)   updates.price_hire   = Number(updates.price_hire)

  const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ event: data })
}
