// lib/apiFetch.js
// ─────────────────────────────────────────────────────────────
// Wrapper around fetch() that automatically attaches the
// Supabase session token as Authorization header on every
// API call. Use this instead of plain fetch() in all pages.
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

export async function apiFetch(url, options = {}) {
  let token = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    token = session?.access_token || null
  } catch {}

  const headers = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return fetch(url, { ...options, headers })
}
