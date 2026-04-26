// pages/api/profile/bookings.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const admin = getAdminClient()
  const { data: bookings } = await admin
    .from('bookings')
    .select('*, events(id,title,event_date,event_type,location)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  res.status(200).json({ bookings: bookings || [] })
}
