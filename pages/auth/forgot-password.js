// pages/auth/forgot-password.js
import { useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage({ session }) {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSent(true); setLoading(false) }
  }

  return (
    <Layout session={session} title="Reset Password">
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2 }}>RESET PASSWORD</h1>
          </div>
          {sent ? (
            <div className="tac-card" style={{ padding: 28, textAlign: 'center' }}>
              <p style={{ color: '#6aaa48', fontSize: 13, marginBottom: 16 }}>✓ Reset link sent — check your email.</p>
              <Link href="/auth/login" className="btn-ghost" style={{ textDecoration: 'none' }}>Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="tac-card" style={{ padding: 28 }}>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label">EMAIL ADDRESS</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="field-input" placeholder="your@email.com" />
              </div>
              {error && <p style={{ fontSize: 12, color: '#c04040', marginBottom: 12 }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
                {loading ? 'SENDING…' : 'SEND RESET LINK'}
              </button>
              <Link href="/auth/login" style={{ display: 'block', textAlign: 'center', fontSize: 12, color: '#4a5e42', textDecoration: 'none' }}>← Back to login</Link>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
