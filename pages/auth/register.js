// pages/auth/register.js
import { useState } from 'react'
import { apiFetch } from '@/lib/apiFetch'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'

export default function RegisterPage({ session }) {
  const router = useRouter()
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  if (session) { router.push('/profile'); return null }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (!form.fullName.trim()) return setError('Please enter your full name.')
    setLoading(true)

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          fullName: form.fullName.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <Layout session={session} title="Registered">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(106,170,72,0.15)', border: '1px solid rgba(106,170,72,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: '#6aaa48', letterSpacing: 2, marginBottom: 12 }}>ACCOUNT CREATED</h1>
          <p style={{ fontSize: 14, color: '#5a6e52', lineHeight: 1.7, marginBottom: 8 }}>
            Check your email for a confirmation link from Swindon Airsoft.
          </p>
          <p style={{ fontSize: 12, color: '#3a4a34', marginBottom: 28 }}>
            Once confirmed, log in and sign your waiver to start booking events.
          </p>
          <Link href="/auth/login" className="btn-primary" style={{ textDecoration: 'none' }}>LOG IN →</Link>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="Create Account">
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#6aaa48', letterSpacing: 3, marginBottom: 4 }}>SWINDON AIRSOFT</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 24, color: '#e0e8d8', letterSpacing: 2 }}>CREATE ACCOUNT</h1>
            <p style={{ fontSize: 12, color: '#4a5e42', marginTop: 8 }}>Register to book events, sign your waiver and apply for UKARA.</p>
          </div>

          <form onSubmit={handleRegister} className="tac-card" style={{ padding: 28 }}>
            {[
              { key: 'fullName', label: 'Full Name',        type: 'text',     placeholder: 'John Smith',        auto: 'name' },
              { key: 'email',    label: 'Email Address',    type: 'email',    placeholder: 'your@email.com',    auto: 'email' },
              { key: 'password', label: 'Password',         type: 'password', placeholder: 'Min. 8 characters', auto: 'new-password' },
              { key: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: 'Repeat password',   auto: 'new-password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="field-label">{f.label} <span style={{ color: '#c04040' }}>*</span></label>
                <input
                  type={f.type}
                  required
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="field-input"
                  placeholder={f.placeholder}
                  autoComplete={f.auto}
                />
              </div>
            ))}

            {error && (
              <div style={{ fontSize: 12, color: '#c04040', marginBottom: 14, background: 'rgba(192,64,64,0.08)', padding: '10px 12px', borderRadius: 4, border: '0.5px solid rgba(192,64,64,0.25)' }}>
                {error}
              </div>
            )}

            <p style={{ fontSize: 11, color: '#3a4a34', marginBottom: 14, lineHeight: 1.5 }}>
              By creating an account you agree to our{' '}
              <Link href="/terms" style={{ color: '#4a5e42' }}>Terms & Conditions</Link> and{' '}
              <Link href="/privacy" style={{ color: '#4a5e42' }}>Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}>
              {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT →'}
            </button>

            <p style={{ fontSize: 12, color: '#4a5e42', textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#6aaa48', textDecoration: 'none' }}>Log in →</Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  )
}
