// pages/admin/profile-edits.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

const FIELD_LABELS = {
  full_name:     'Full Name',
  phone:         'Phone',
  date_of_birth: 'Date of Birth',
  address_line1: 'Address Line 1',
  address_line2: 'Address Line 2',
  city:          'City / Town',
  postcode:      'Postcode',
}

export default function AdminProfileEditsPage({ session }) {
  const router  = useRouter()
  const [edits,     setEdits]    = useState([])
  const [loading,   setLoading]  = useState(true)
  const [authState, setAuth]     = useState('checking')
  const [msg,       setMsg]      = useState('')
  const [expanded,  setExpanded] = useState(null)

  useEffect(() => {
    if (session === undefined) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok'); loadEdits()
    })
  }, [session])

  const loadEdits = () => {
    apiFetch('/api/admin/profile-edits/pending').then(r => r.json()).then(d => {
      setEdits(d.edits || [])
      setLoading(false)
    })
  }

  const handleAction = async (id, action) => {
    const res = await apiFetch(`/api/admin/profile-edits/${action}`, {
      method: 'POST', body: JSON.stringify({ id }),
    })
    const d = await res.json()
    if (res.ok) {
      setMsg(`Edit ${action}d successfully.`)
      setExpanded(null)
      loadEdits()
    } else {
      setMsg(d.error || 'Error')
    }
  }

  const card = (content, style = {}) => (
    <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, ...style }}>
      {content}
    </div>
  )

  if (authState !== 'ok') return (
    <AdminLayout session={session} title="Profile Edits">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono",monospace', fontSize: 11 }}>LOADING…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout session={session} title="Profile Edit Approvals">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2 }}>PROFILE EDIT APPROVALS</h1>
          {edits.length > 0 && (
            <div style={{ fontSize: 11, background: 'rgba(200,160,48,0.1)', color: '#c8a030', padding: '4px 12px', borderRadius: 3, border: '0.5px solid rgba(200,160,48,0.3)', fontFamily: '"JetBrains Mono",monospace' }}>
              {edits.length} PENDING
            </div>
          )}
        </div>

        {msg && (
          <div style={{ fontSize: 12, color: msg.includes('rror') ? '#c04040' : '#6aaa48', marginBottom: 16, padding: '10px 14px', background: 'rgba(106,170,72,0.06)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
            {msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: '#4a5e42', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#4a5e42', fontSize: 12 }}>Loading…</p>
        ) : edits.length === 0 ? (
          <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 48, textAlign: 'center' }}>
            <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 24, color: '#2e3e28', letterSpacing: 2, marginBottom: 8 }}>ALL CLEAR</div>
            <p style={{ color: '#2e3e28', fontSize: 13 }}>No pending profile edits.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {edits.map(edit => {
              const isOpen = expanded === edit.id
              const changedFields = Object.keys(FIELD_LABELS).filter(k => edit[k])

              return (
                <div key={edit.id} style={{ background: '#0d1209', border: `0.5px solid ${isOpen ? 'rgba(200,160,48,0.4)' : '#1e2a1a'}`, borderRadius: 6, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  {/* Header row */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : edit.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', cursor: 'pointer', flexWrap: 'wrap', gap: 10 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: 13, color: '#c0d0b8', fontWeight: 500 }}>{edit.profiles?.full_name || 'Unknown Player'}</span>
                        <span style={{ fontSize: 10, color: '#3a4a34', marginLeft: 10 }}>{edit.profiles?.email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {changedFields.slice(0, 3).map(k => (
                          <span key={k} style={{ fontSize: 9, background: 'rgba(200,160,48,0.1)', color: '#c8a030', padding: '2px 7px', borderRadius: 2, border: '0.5px solid rgba(200,160,48,0.2)', fontFamily: '"JetBrains Mono",monospace' }}>
                            {FIELD_LABELS[k].toUpperCase()}
                          </span>
                        ))}
                        {changedFields.length > 3 && (
                          <span style={{ fontSize: 9, color: '#3a4a34' }}>+{changedFields.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, color: '#3a4a34' }}>
                        {edit.submitted_at ? format(new Date(edit.submitted_at), 'd MMM yyyy HH:mm') : '—'}
                      </span>
                      <span style={{ fontSize: 16, color: '#4a5e42', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded comparison */}
                  {isOpen && (
                    <div style={{ borderTop: '0.5px solid #1e2a1a' }}>
                      {/* Before / After comparison */}
                      <div style={{ padding: '16px 18px' }}>
                        <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 14 }}>FIELD-BY-FIELD COMPARISON</div>

                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 8, marginBottom: 6 }}>
                          <div />
                          <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 1 }}>CURRENT VALUE</div>
                          <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#c8a030', letterSpacing: 1 }}>REQUESTED CHANGE</div>
                        </div>

                        {changedFields.map(k => {
                          const currentVal  = edit.profiles?.[k]
                          const requestedVal = edit[k]
                          const changed = currentVal !== requestedVal

                          return (
                            <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #1a2218', alignItems: 'center' }}>
                              <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 1 }}>
                                {FIELD_LABELS[k].toUpperCase()}
                              </div>
                              <div style={{ fontSize: 13, color: currentVal ? '#8a9a84' : '#3a4a34', fontStyle: currentVal ? 'normal' : 'italic' }}>
                                {currentVal || 'not set'}
                              </div>
                              <div style={{ fontSize: 13, color: changed ? '#c8a030' : '#4a5e42', fontWeight: changed ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {changed && <span style={{ fontSize: 10 }}>→</span>}
                                {requestedVal || '—'}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding: '14px 18px', borderTop: '0.5px solid #1e2a1a', display: 'flex', gap: 10, background: 'rgba(0,0,0,0.15)' }}>
                        <button
                          onClick={() => handleAction(edit.id, 'approve')}
                          style={{ flex: 1, padding: '10px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}
                        >
                          ✓ APPROVE CHANGES
                        </button>
                        <button
                          onClick={() => handleAction(edit.id, 'reject')}
                          style={{ padding: '10px 20px', background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.3)', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          REJECT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
