// pages/api/ukara/apply.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = getAdminClient()

  // Check eligibility
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
  const { count: gameDays } = await supabase
    .from('game_day_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .gte('attended_date', twelveMonthsAgo.toISOString())

  if ((gameDays || 0) < 3) {
    return res.status(400).json({ error: `Not eligible: only ${gameDays || 0}/3 game days in last 12 months.` })
  }

  // Create pending application record first
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { data: application, error: appError } = await supabase
    .from('ukara_applications')
    .insert({
      user_id:    session.user.id,
      status:     'pending_payment',
      amount_paid: 5.00,
      expires_at:  expiresAt.toISOString(),
      applied_at:  new Date().toISOString(),
    })
    .select()
    .single()

  if (appError) return res.status(500).json({ error: appError.message })

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', session.user.id)
    .maybeSingle()

  const customerEmail = profile?.email || session.user.email

  // Try Stripe checkout — gracefully handle missing config
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    // Stripe not configured — mark as pending_review directly (useful for testing)
    await supabase
      .from('ukara_applications')
      .update({ status: 'pending_review' })
      .eq('id', application.id)
    return res.status(200).json({
      checkoutUrl: null,
      message: 'Stripe not configured. Application submitted for review.',
      applicationId: application.id,
    })
  }

  try {
    const { createUkaraCheckout } = await import('@/lib/stripe')
    const checkoutSession = await createUkaraCheckout({
      applicationId: application.id,
      customerEmail,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/profile/ukara?success=1`,
      cancelUrl:  `${process.env.NEXT_PUBLIC_SITE_URL}/profile/ukara?cancelled=1`,
    })

    await supabase
      .from('ukara_applications')
      .update({ stripe_session_id: checkoutSession.id })
      .eq('id', application.id)

    return res.status(200).json({ checkoutUrl: checkoutSession.url })
  } catch (stripeErr) {
    console.error('Stripe error:', stripeErr)
    // Clean up the pending application if Stripe fails
    await supabase.from('ukara_applications').delete().eq('id', application.id)
    return res.status(500).json({ error: 'Payment system error. Please try again or contact us.' })
  }
}
