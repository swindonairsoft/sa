// lib/auth.js
// ─────────────────────────────────────────────────────────────
// Authentication helpers
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

/** Sign up a new player */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) throw error

  // Create profile record
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      created_at: new Date().toISOString(),
    })
  }

  return data
}

/** Sign in */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Get current session */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** Get current user */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** Check if user is admin */
export async function isAdmin(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return false
  return !!data
}

/** Password reset */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })
  if (error) throw error
}

/** Update password */
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
