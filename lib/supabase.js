// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ── Browser client (singleton) ────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// ── Admin client (server only) ────────────────────────────────
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ── Parse cookies from request header ────────────────────────
function parseCookies(req) {
  const header = req.headers?.cookie || ''
  const cookies = {}
  header.split(';').forEach(pair => {
    const eqIdx = pair.indexOf('=')
    if (eqIdx < 0) return
    const key = pair.slice(0, eqIdx).trim()
    try {
      cookies[key] = decodeURIComponent(pair.slice(eqIdx + 1).trim())
    } catch {
      cookies[key] = pair.slice(eqIdx + 1).trim()
    }
  })
  return cookies
}

// ── Extract JWT from Supabase cookies ────────────────────────
function extractToken(req) {
  // Try Authorization header first
  const auth = req.headers?.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)

  const cookies = parseCookies(req)

  // Supabase v2 splits large cookies into chunks: sb-xxx-auth-token.0, .1, etc.
  // Find all chunk keys and reassemble
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
  const baseKey = `sb-${projectRef}-auth-token`

  // Try chunked format first
  const chunks = []
  for (let i = 0; i <= 5; i++) {
    const chunk = cookies[`${baseKey}.${i}`]
    if (chunk) chunks.push(chunk)
    else break
  }

  let rawValue = null

  if (chunks.length > 0) {
    rawValue = chunks.join('')
  } else if (cookies[baseKey]) {
    rawValue = cookies[baseKey]
  } else {
    // Fallback: scan all cookies for auth tokens
    for (const [key, val] of Object.entries(cookies)) {
      if ((key.includes('auth-token') || key.includes('access-token')) && val?.length > 20) {
        rawValue = val
        break
      }
    }
  }

  if (!rawValue) return null

  // Parse the value — could be JSON array, JSON object, or raw JWT
  try {
    const parsed = JSON.parse(rawValue)
    if (Array.isArray(parsed) && parsed[0]?.startsWith('eyJ')) return parsed[0]
    if (parsed?.access_token) return parsed.access_token
    if (typeof parsed === 'string' && parsed.startsWith('eyJ')) return parsed
  } catch {
    if (rawValue.startsWith('eyJ')) return rawValue
  }

  return null
}

// ── Get session from API request ─────────────────────────────
export async function getSessionFromRequest(req) {
  try {
    const token = extractToken(req)
    if (!token) return null

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
