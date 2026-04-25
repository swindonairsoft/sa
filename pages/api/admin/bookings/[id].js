// pages/api/admin/bookings/[id].js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, events(id,title,event_date), profiles(id,full_name,email,phone)')
    .eq('id', id)
    .single()

  res.status(200).json({ booking: booking || null })
}
