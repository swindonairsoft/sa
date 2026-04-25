// pages/api/admin/players/log-gameday.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })

  const { userId, eventId, date } = req.body
  if (!userId || !date) return res.status(400).json({ error: 'userId and date required' })

  const { data, error } = await supabase.from('game_day_log').insert({
    user_id: userId,
    event_id: eventId || null,
    attended_date: date,
    logged_by: session.user.id,
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ ok: true, entry: data })
}
