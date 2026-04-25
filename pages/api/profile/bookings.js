// pages/api/profile/bookings.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: bookings } = await supabase.from('bookings').select('*, events(id,title,event_date,event_type,location)').eq('user_id', session.user.id).order('created_at', { ascending: false })
  res.status(200).json({ bookings: bookings || [] })
}
