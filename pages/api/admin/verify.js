// pages/api/admin/verify.js
import { getSessionFromRequest, isAdminUser } from '@/lib/supabase'

export default async function handler(req, res) {
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(200).json({ isAdmin: false })
  const adminOk = await isAdminUser(session.user.id)
  res.status(200).json({ isAdmin: adminOk })
}
