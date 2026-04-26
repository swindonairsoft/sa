// pages/api/auth/register.js
import { createClient } from '@supabase/supabase-js'
import { getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password, fullName } = req.body
  if (!email || !password || !fullName) return res.status(400).json({ error: 'All fields required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  // Check if user already exists first using admin client
  const admin = getAdminClient()
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const alreadyExists = existingUsers?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase())
  if (alreadyExists) {
    return res.status(400).json({ error: 'An account with this email already exists.' })
  }

  // Use a regular client to sign up — this sends the confirmation email correctly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const client = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: fullName.trim() },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return res.status(400).json({ error: error.message })

  // Also manually insert profile as belt-and-braces (trigger should handle it too)
  if (data?.user?.id) {
    await admin.from('profiles').upsert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  }

  res.status(200).json({ ok: true })
}
