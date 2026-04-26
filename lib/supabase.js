// lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Supabase client — browser + server helpers
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Browser client (singleton)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// Server-side client using the request's auth token
// Usage: const supabase = getServerClient(req)
export function getServerClient(req) {
  const token = extractToken(req)
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Admin client with service role — server only, never expose to browser
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Pull the JWT from cookie or Authorization header
function extractToken(req) {
  // Try Authorization header first
  const authHeader = req.headers?.authorization
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)

  // Try cookies
  const cookieHeader = req.headers?.cookie || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )

  // Supabase stores token in sb-{ref}-auth-token cookie (newer) or supabase-auth-token (older)
  for (const [key, val] of Object.entries(cookies)) {
    if (key.includes('auth-token') || key.includes('access-token')) {
      try {
        const parsed = JSON.parse(decodeURIComponent(val))
        if (Array.isArray(parsed)) return parsed[0]
        if (parsed?.access_token) return parsed.access_token
        return parsed
      } catch {
        if (val && val.length > 20) return val
      }
    }
  }
  return null
}

// Helper used by all API routes — gets session from request
export async function getSessionFromRequest(req) {
  const supabaseServer = getServerClient(req)
  const { data: { user }, error } = await supabaseServer.auth.getUser()
  if (error || !user) return null
  return { user }
}

// Check if user is admin
export async function isAdminUser(userId) {
  const admin = getAdminClient()
  const { data } = await admin
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
