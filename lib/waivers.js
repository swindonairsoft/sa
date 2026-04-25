// lib/waivers.js
// ─────────────────────────────────────────────────────────────
// All database queries relating to waivers
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

/** Get a player's waiver */
export async function getWaiver(userId) {
  const { data, error } = await supabase
    .from('waivers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Submit or update waiver
 * If a waiver already exists, the updated version is sent for admin approval
 */
export async function submitWaiver(userId, payload) {
  const existing = await getWaiver(userId)

  if (!existing) {
    // First-time submission — create directly, mark pending approval
    const { data, error } = await supabase
      .from('waivers')
      .insert({
        user_id: userId,
        ...payload,
        status: 'pending_approval',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    // Update — write to pending_waiver_edits for admin review
    const { data, error } = await supabase
      .from('pending_waiver_edits')
      .upsert({
        user_id: userId,
        waiver_id: existing.id,
        ...payload,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

/** Check if player has a valid approved waiver */
export async function hasValidWaiver(userId) {
  const waiver = await getWaiver(userId)
  return waiver?.status === 'approved'
}

/** Admin: get all pending waiver approvals */
export async function getPendingWaivers() {
  // New waivers
  const { data: newWaivers, error: e1 } = await supabase
    .from('waivers')
    .select(`*, profiles(full_name, email, date_of_birth)`)
    .eq('status', 'pending_approval')
    .order('submitted_at', { ascending: true })

  // Edits to existing waivers
  const { data: editedWaivers, error: e2 } = await supabase
    .from('pending_waiver_edits')
    .select(`*, profiles(full_name, email, date_of_birth)`)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  if (e1) throw e1
  if (e2) throw e2

  return {
    new: newWaivers || [],
    edits: editedWaivers || [],
  }
}

/** Admin: approve a waiver */
export async function approveWaiver(waiverId) {
  const { data, error } = await supabase
    .from('waivers')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', waiverId)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Admin: approve a waiver edit */
export async function approveWaiverEdit(editId) {
  const { data: edit, error: fetchErr } = await supabase
    .from('pending_waiver_edits')
    .select('*')
    .eq('id', editId)
    .single()
  if (fetchErr) throw fetchErr

  const { submitted_at, status, id, waiver_id, ...waiverFields } = edit

  // Apply to real waiver
  const { data, error } = await supabase
    .from('waivers')
    .update({ ...waiverFields, status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', waiver_id)
    .select()
    .single()
  if (error) throw error

  // Mark edit as approved
  await supabase
    .from('pending_waiver_edits')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', editId)

  return data
}

/** Admin: reject a waiver or edit */
export async function rejectWaiver(waiverId, isEdit = false, reason = '') {
  const table = isEdit ? 'pending_waiver_edits' : 'waivers'
  const { data, error } = await supabase
    .from(table)
    .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() })
    .eq('id', waiverId)
    .select()
    .single()
  if (error) throw error
  return data
}
