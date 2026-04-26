// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ── Browser client (singleton) ────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// ── Admin client (server only — never expose to browser) ──────
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ── Get session from API request ─────────────────────────────
// Reads the Bearer token from the Authorization header
// (sent by apiFetch helper below)
export async function getSessionFromRequest(req) {
  try {
    const auth = req.headers?.authorization
    if (!auth?.startsWith('Bearer ')) return null

    const token = auth.slice(7)
    if (!token || token.length < 10) return null

    // Verify token with Supabase
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: { user }, error } = await client.auth.getUser()
    if (error || !user) return null
    return { user }
  } catch {
    return null
  }
}

// ── Check admin status ────────────────────────────────────────
export async function isAdminUser(userId) {
  try {
    const admin = getAdminClient()
    const { data } = await admin
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}
