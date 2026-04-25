// pages/auth/login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'

export default function LoginPage({ session }) {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  if (session) { router.push('/profile'); return null }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push(router.query.redirect || '/profile')
  }

  return (
    <Layout session={session} title="Log In">
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#6aaa48', letterSpacing: 3, marginBottom: 4 }}>SWINDON AIRSOFT</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 24, color: '#e0e8d8', letterSpacing: 2 }}>PLAYER LOGIN</h1>
          </div>

          <form onSubmit={handleLogin} className="tac-card" style={{ padding: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">EMAIL ADDRESS</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="field-input" placeholder="your@email.com" autoComplete="email" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="field-input" placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && <p style={{ fontSize: 12, color: '#c04040', marginBottom: 12, background: 'rgba(192,64,64,0.08)', padding: '8px 12px', borderRadius: 4, border: '0.5px solid rgba(192,64,64,0.25)' }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
              {loading ? 'LOGGING IN…' : 'LOG IN →'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <Link href="/auth/forgot-password" style={{ color: '#4a5e42', textDecoration: 'none' }}>Forgot password?</Link>
              <Link href="/auth/register" style={{ color: '#6aaa48', textDecoration: 'none' }}>Create account →</Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
