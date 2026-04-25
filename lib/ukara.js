// lib/ukara.js
// ─────────────────────────────────────────────────────────────
// All database queries relating to UKARA applications
// £5/year fee — requires 3 game days at Swindon Airsoft in last 12 months
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'
import { getPlayerGameDays } from './players'

export const UKARA_ANNUAL_FEE = 5.00
export const UKARA_REQUIRED_GAME_DAYS = 3

/** Check if a player is eligible for UKARA */
export async function checkUkaraEligibility(userId) {
  const gameDays = await getPlayerGameDays(userId)
  return {
    eligible: gameDays >= UKARA_REQUIRED_GAME_DAYS,
    gameDays,
    required: UKARA_REQUIRED_GAME_DAYS,
    shortfall: Math.max(0, UKARA_REQUIRED_GAME_DAYS - gameDays),
  }
}

/** Get a player's UKARA application(s) */
export async function getPlayerUkara(userId) {
  const { data, error } = await supabase
    .from('ukara_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Get active (approved) UKARA for a player */
export async function getActiveUkara(userId) {
  const { data, error } = await supabase
    .from('ukara_applications')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .gte('expires_at', new Date().toISOString())
    .maybeSingle()
  if (error) throw error
  return data
}

/** Submit a UKARA application */
export async function submitUkaraApplication(userId, stripePaymentIntentId) {
  const eligibility = await checkUkaraEligibility(userId)
  if (!eligibility.eligible) {
    throw new Error(`Not eligible: only ${eligibility.gameDays}/${eligibility.required} game days in last 12 months`)
  }

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { data, error } = await supabase
    .from('ukara_applications')
    .insert({
      user_id: userId,
      stripe_payment_intent: stripePaymentIntentId,
      amount_paid: UKARA_ANNUAL_FEE,
      status: 'pending_review',
      expires_at: expiresAt.toISOString(),
      applied_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Admin: get all UKARA applications */
export async function getAllUkaraApplications(statusFilter = null) {
  let query = supabase
    .from('ukara_applications')
    .select(`
      *,
      profiles (id, full_name, email, phone, address_line1, address_line2, city, postcode, date_of_birth),
      game_day_log (count)
    `)
    .order('applied_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data, error } = await query
  if (error) throw error
  return data
}

/** Admin: approve a UKARA application and assign number */
export async function approveUkara(applicationId, ukaraNumber) {
  const { data, error } = await supabase
    .from('ukara_applications')
    .update({
      status: 'approved',
      ukara_number: ukaraNumber,
      approved_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .select()
    .single()
  if (error) throw error

  // Also update the player's profile with the UKARA number
  await supabase
    .from('profiles')
    .update({ ukara_number: ukaraNumber, ukara_expires_at: data.expires_at })
    .eq('id', data.user_id)

  return data
}

/** Admin: reject a UKARA application */
export async function rejectUkara(applicationId, reason = '') {
  const { data, error } = await supabase
    .from('ukara_applications')
    .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single()
  if (error) throw error
  return data
}
