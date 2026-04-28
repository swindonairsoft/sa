// pages/admin/profile-edits.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

export default function AdminProfileEditsPage({ session }) {
  const router = useRouter()
  const [edits,     setEdits]    = useState([])
  const [loading,   setLoading]  = useState(true)
  const [authState, setAuth]     = useState('checking')
  const [msg,       setMsg]      = useState('')

  useEffect(() => {
    if (session === undefined) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok'); loadEdits()
    })
  }, [session])

  const loadEdits = () => {
    apiFetch('/api/admin/profile-edits').then(r => r.json()).then(d => {
      setEdits(d.edits || [])
      setLoading(false)
    })
  }

  const handleAction = async (id, action) => {
    const res = await apiFetch(`/api/admin/profile-edits/${action}`, {
      method: 'POST', body: JSON.stringify({ id }),
    })
    const d = await res.json()
    if (res.ok) { setMsg(`Edit ${action}d.`); loadEdits() }
    else setMsg(d.error || 'Error')
  }

  if (authState !== 'ok') return (
    <Layout session={session} title="Profile Edits">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>LOADING…</p>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="Profile Edit Approvals">
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        <Link href="/admin/players" style={{ fontSize: 11, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Players</Link>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2, marginBottom: 20 }}>PROFILE EDIT APPROVALS</h1>

        {msg && (
          <div style={{ fontSize: 12, color: '#6aaa48', marginBottom: 16, padding: '8px 12px', background: 'rgba(106,170,72,0.08)', border: '0.5px solid rgba(106,170,72,0.2)', borderRadius: 4 }}>
            {msg}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#4a5e42', fontSize: 12 }}>Loading…</p>
        ) : edits.length === 0 ? (
          <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 32, textAlign: 'center' }}>
            <p style={{ color: '#2e3e28', fontSize: 13 }}>No pending profile edits.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {edits.map(edit => (
              <div key={edit.id} style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 13, color: '#c0d0b8', fontWeight: 500 }}>{edit.profiles?.full_name || 'Unknown'}</span>
                    <span style={{ fontSize: 10, color: '#3a4a34', marginLeft: 8 }}>{edit.profiles?.email}</span>
                    <span style={{ fontSize: 10, color: '#3a4a34', marginLeft: 8 }}>
                      Submitted: {edit.submitted_at ? format(new Date(edit.submitted_at), 'd MMM yyyy HH:mm') : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleAction(edit.id, 'approve')} style={{ fontSize: 10, padding: '5px 12px', borderRadius: 3, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer', fontWeight: 600 }}>APPROVE</button>
                    <button onClick={() => handleAction(edit.id, 'reject')}  style={{ fontSize: 10, padding: '5px 12px', borderRadius: 3, background: 'rgba(192,64,64,0.1)',  color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)',  cursor: 'pointer', fontWeight: 600 }}>REJECT</button>
                  </div>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 1, marginBottom: 10 }}>REQUESTED CHANGES</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {[
                      ['Full Name',    edit.full_name],
                      ['Phone',        edit.phone],
                      ['Date of Birth',edit.date_of_birth],
                      ['Address Line 1',edit.address_line1],
                      ['Address Line 2',edit.address_line2],
                      ['City',         edit.city],
                      ['Postcode',     edit.postcode],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} style={{ background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, color: '#3a4a34', fontFamily: '"JetBrains Mono", monospace', marginBottom: 3 }}>{label.toUpperCase()}</div>
                        <div style={{ fontSize: 12, color: '#c0d0b8' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
