// pages/api/admin/waivers/pending.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '@/lib/supabase'
export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const adminOk = await isAdminUser(session.user.id)
  if (!adminOk) return res.status(403).json({ error: 'Forbidden' })
  const { data: newW }  = await supabase.from('waivers').select('*, profiles(full_name,email)').eq('status','pending_approval').order('submitted_at',{ascending:true})
  const { data: editW } = await supabase.from('pending_waiver_edits').select('*, profiles(full_name,email)').eq('status','pending').order('submitted_at',{ascending:true})
  res.status(200).json({ new: newW || [], edits: editW || [] })
}
