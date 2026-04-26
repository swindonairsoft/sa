// lib/apiFetch.js
// ─────────────────────────────────────────────────────────────
// Drop-in replacement for fetch() that automatically attaches
// the Supabase session token as an Authorization header.
// Use this for ALL client-side API calls instead of plain fetch().
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

export async function apiFetch(url, options = {}) {
  // Get current session token
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(url, { ...options, headers })
  return res
}
