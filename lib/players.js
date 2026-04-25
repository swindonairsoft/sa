// lib/players.js
// ─────────────────────────────────────────────────────────────
// All database queries relating to player profiles
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

/** Get a player's profile */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

/** Upsert profile (player self-update — goes pending_approval) */
export async function updateProfile(userId, payload) {
  // Write to pending_profile_edits — admin must approve
  const { data, error } = await supabase
    .from('pending_profile_edits')
    .upsert({ user_id: userId, ...payload, submitted_at: new Date().toISOString(), status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Admin approves a profile edit */
export async function approveProfileEdit(editId, userId) {
  // Fetch pending edit
  const { data: edit, error: fetchErr } = await supabase
    .from('pending_profile_edits')
    .select('*')
    .eq('id', editId)
    .single()
  if (fetchErr) throw fetchErr

  const { submitted_at, status, id, ...profileFields } = edit

  // Apply to real profile
  const { data, error } = await supabase
    .from('profiles')
    .update(profileFields)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error

  // Mark edit as approved
  await supabase
    .from('pending_profile_edits')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', editId)

  return data
}

/** Count game days attended at Swindon Airsoft in last 12 months */
export async function getPlayerGameDays(userId) {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const { count, error } = await supabase
    .from('game_day_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('attended_date', twelveMonthsAgo.toISOString())

  if (error) throw error
  return count || 0
}

/** Log a game day attendance (admin — on check-in) */
export async function logGameDay(userId, eventId, attendedDate) {
  const { data, error } = await supabase
    .from('game_day_log')
    .insert({ user_id: userId, event_id: eventId, attended_date: attendedDate })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Get all players (admin) */
export async function getAllPlayers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      waivers (id, status, signed_at),
      game_day_log (count)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Get pending profile edits (admin) */
export async function getPendingProfileEdits() {
  const { data, error } = await supabase
    .from('pending_profile_edits')
    .select(`*, profiles(full_name, email)`)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })
  if (error) throw error
  return data
}
