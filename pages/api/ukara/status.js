// pages/api/ukara/status.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: ukara } = await supabase.from('ukara_applications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  res.status(200).json({ ukara: ukara || null })
}
