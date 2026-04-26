// pages/api/ukara/apply.js
import { getSessionFromRequest, isAdminUser, getAdminClient } from '../../../lib/supabase'
import { createUkaraCheckout } from '../../../lib/stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  const supabase = getAdminClient()
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  // Check eligibility
  const twelveMonthsAgo = new Date(); twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
  const { count: gameDays } = await supabase.from('game_day_log').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).gte('attended_date', twelveMonthsAgo.toISOString())
  if ((gameDays || 0) < 3) return res.status(400).json({ error: `Not eligible: only ${gameDays || 0}/3 game days in last 12 months.` })

  // Create pending application
  const expiresAt = new Date(); expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  const { data: application, error } = await supabase.from('ukara_applications').insert({
    user_id: session.user.id, status: 'pending_payment', amount_paid: 5.00,
    expires_at: expiresAt.toISOString(), applied_at: new Date().toISOString(),
  }).select().single()
  if (error) return res.status(500).json({ error: error.message })

  const { data: profile } = await supabase.from('profiles').select('email').eq('id', session.user.id).single()

  const checkoutSession = await createUkaraCheckout({
    applicationId: application.id,
    customerEmail: profile?.email || session.user.email,
    successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/profile/ukara?success=1`,
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/profile/ukara?cancelled=1`,
  })

  // Save session id
  await supabase.from('ukara_applications').update({ stripe_session_id: checkoutSession.id }).eq('id', application.id)

  res.status(200).json({ checkoutUrl: checkoutSession.url })
}
