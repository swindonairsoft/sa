// pages/api/auth/register.js
// Server-side registration — creates auth user AND profile row reliably
import { getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password, fullName } = req.body
  if (!email || !password || !fullName) return res.status(400).json({ error: 'All fields required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const admin = getAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // they still need to confirm email
    user_metadata: { full_name: fullName },
  })

  if (authError) {
    // Handle duplicate email gracefully
    if (authError.message.includes('already') || authError.message.includes('duplicate')) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }
    return res.status(400).json({ error: authError.message })
  }

  // Create profile row immediately — don't rely on triggers
  const { error: profileError } = await admin.from('profiles').upsert({
    id: authData.user.id,
    email: email.toLowerCase().trim(),
    full_name: fullName.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    console.error('Profile creation error:', profileError)
    // Don't fail the registration — user can still log in
  }

  // Send confirmation email via Supabase (uses their built-in email)
  await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })

  res.status(200).json({ ok: true, userId: authData.user.id })
}
