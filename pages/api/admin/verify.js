// pages/api/admin/verify.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../lib/supabase'
export default async function handler(req, res) {
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(200).json({ isAdmin: false })
  const { data } = await supabase.from('admin_users').select('id').eq('user_id', session.user.id).maybeSingle()
  res.status(200).json({ isAdmin: !!data })
}
