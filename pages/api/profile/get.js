// pages/api/profile/get.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  res.status(200).json({ profile: profile || null })
}
