// pages/auth/callback.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/profile')
      else router.push('/auth/login')
    })
  }, [])
  return (
    <div style={{ minHeight: '100vh', background: '#080c07', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}>Verifying…</p>
    </div>
  )
}
