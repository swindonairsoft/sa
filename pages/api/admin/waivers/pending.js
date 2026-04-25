// pages/api/admin/waivers/pending.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const { data: admin } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  if (!admin) return res.status(403).json({ error: 'Forbidden' })
  const { data: newW }  = await supabase.from('waivers').select('*, profiles(full_name,email)').eq('status','pending_approval').order('submitted_at',{ascending:true})
  const { data: editW } = await supabase.from('pending_waiver_edits').select('*, profiles(full_name,email)').eq('status','pending').order('submitted_at',{ascending:true})
  res.status(200).json({ new: newW || [], edits: editW || [] })
}
