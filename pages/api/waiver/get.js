// pages/api/waiver/get.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { data: waiver } = await supabase
    .from('waivers')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  res.status(200).json({ waiver: waiver || null })
}
