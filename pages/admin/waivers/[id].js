// pages/admin/waivers/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

const SECTION_LABELS = {
  liability:      'Liability & Risk Acceptance',
  rules:          'Site Rules & Marshal Authority',
  eye_protection: 'Eye Protection',
  chronograph:    'Chronograph & FPS Limits',
  medical:        'Medical Disclosure',
  indemnity:      'Indemnity & Legal Release',
  photos:         'Photography & Media',
  pyro:           'Pyrotechnics Use (18+ Only)',
  data:           'Data Protection & Privacy',
}

export default function AdminWaiverViewPage({ session }) {
  const router = useRouter()
  const { id, type } = router.query
  const [waiver,    setWaiver]    = useState(null)
  const [player,    setPlayer]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authState, setAuth]      = useState('checking')
  const [msg,       setMsg]       = useState('')
  const isEdit = type === 'edit'

  useEffect(() => {
    if (session === undefined || !id) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok')
      loadWaiver()
    })
  }, [session, id])

  const loadWaiver = async () => {
    const res = await apiFetch(`/api/admin/waivers/${id}?type=${type || 'new'}`)
    const d = await res.json()
    setWaiver(d.waiver || null)
    setPlayer(d.player || null)
    setLoading(false)
  }

  const handleAction = async (action) => {
    const reason = action === 'reject' ? (prompt('Reason for rejection (optional):') || '') : ''
    const res = await apiFetch(`/api/admin/waivers/${action}`, {
      method: 'POST',
      body: JSON.stringify({ id, isEdit, reason }),
    })
    const d = await res.json()
    if (res.ok) {
      setMsg(`Waiver ${action}d successfully.`)
      setTimeout(() => router.push('/admin'), 1500)
    } else {
      setMsg(d.error || 'Error')
    }
  }

  if (authState !== 'ok') return (
    <Layout session={session} title="View Waiver">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>LOADING…</p>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="View Waiver">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
        <Link href="/admin" style={{ fontSize: 11, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Admin dashboard</Link>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2, marginBottom: 20 }}>
          {isEdit ? 'WAIVER EDIT REVIEW' : 'WAIVER REVIEW'}
        </h1>

        {msg && (
          <div style={{ fontSize: 12, color: msg.includes('Error') ? '#c04040' : '#6aaa48', marginBottom: 16, padding: '10px 14px', background: msg.includes('Error') ? 'rgba(192,64,64,0.08)' : 'rgba(106,170,72,0.08)', border: `0.5px solid ${msg.includes('Error') ? 'rgba(192,64,64,0.2)' : 'rgba(106,170,72,0.2)'}`, borderRadius: 4 }}>
            {msg}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#4a5e42', fontSize: 12 }}>Loading waiver…</p>
        ) : !waiver ? (
          <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 32, textAlign: 'center' }}>
            <p style={{ color: '#c04040', fontSize: 13 }}>Waiver not found.</p>
          </div>
        ) : (
          <>
            {/* Player info */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 12 }}>PLAYER DETAILS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {[
                  ['Player',     player?.full_name || '—'],
                  ['Email',      player?.email || '—'],
                  ['Submitted',  waiver.submitted_at ? format(new Date(waiver.submitted_at), 'd MMM yyyy HH:mm') : '—'],
                  ['Status',     waiver.status?.toUpperCase().replace(/_/g,' ') || '—'],
                  ['Under 18',   waiver.is_under18 ? 'YES' : 'No'],
                  ['DOB',        waiver.date_of_birth ? format(new Date(waiver.date_of_birth), 'd MMM yyyy') : '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 1, marginBottom: 3 }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: '#c0d0b8' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* U18 parent data */}
            {waiver.is_under18 && waiver.parent_data && (
              <div style={{ background: 'rgba(200,160,48,0.06)', border: '0.5px solid rgba(200,160,48,0.3)', borderRadius: 6, padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#c8a030', letterSpacing: 2, marginBottom: 12 }}>⚠ U18 — PARENT / GUARDIAN CONSENT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {[
                    ['Parent Name',      waiver.parent_data.parentName],
                    ['Parent Email',     waiver.parent_data.parentEmail],
                    ['Parent Phone',     waiver.parent_data.parentPhone],
                    ['Parent Signature', waiver.parent_data.parentSignature],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#8a6020', letterSpacing: 1, marginBottom: 3 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: '#c8a030', fontStyle: label.includes('Signature') ? 'italic' : 'normal' }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical disclosure */}
            {waiver.text_values?.medical && (
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 8 }}>MEDICAL DISCLOSURE</div>
                <p style={{ fontSize: 13, color: '#8a9a84', lineHeight: 1.7, margin: 0 }}>{waiver.text_values.medical}</p>
              </div>
            )}

            {/* Waiver sections */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 12 }}>SECTIONS AGREED</div>
              {Object.entries(waiver.sections_agreed || {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #1a2218' }}>
                  <span style={{ fontSize: 16, color: val ? '#6aaa48' : '#c04040', flexShrink: 0 }}>{val ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 12, color: val ? '#8a9a84' : '#5a3a3a' }}>
                    {SECTION_LABELS[key] || key.replace(/_/g, ' ')}
                    {key === 'pyro' && waiver.is_under18 && (
                      <span style={{ fontSize: 9, color: '#c04040', marginLeft: 8, fontFamily: '"JetBrains Mono", monospace' }}>BLOCKED — U18</span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* E-Signature */}
            {waiver.esign_name && (
              <div style={{ background: 'rgba(106,170,72,0.05)', border: '0.5px solid rgba(106,170,72,0.2)', borderRadius: 6, padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 8 }}>ELECTRONIC SIGNATURE</div>
                <div style={{ fontSize: 15, color: '#6aaa48', fontStyle: 'italic', marginBottom: 4 }}>{waiver.esign_name}</div>
                <div style={{ fontSize: 11, color: '#3a4a34' }}>{waiver.esign_date || (waiver.signed_at ? format(new Date(waiver.signed_at), 'd MMMM yyyy') : '—')}</div>
              </div>
            )}

            {/* Action buttons — only show if pending */}
            {(waiver.status === 'pending_approval' || waiver.status === 'pending') && (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => handleAction('approve')}
                  style={{ flex: 1, padding: '12px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}
                >
                  ✓ APPROVE WAIVER
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  style={{ padding: '12px 20px', background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.3)', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  REJECT
                </button>
              </div>
            )}

            {waiver.status === 'approved' && (
              <div style={{ padding: '12px 16px', background: 'rgba(106,170,72,0.08)', border: '0.5px solid rgba(106,170,72,0.2)', borderRadius: 4, fontSize: 12, color: '#6aaa48', textAlign: 'center' }}>
                ✓ APPROVED {waiver.approved_at ? format(new Date(waiver.approved_at), 'd MMM yyyy HH:mm') : ''}
              </div>
            )}
            {waiver.status === 'rejected' && (
              <div style={{ padding: '12px 16px', background: 'rgba(192,64,64,0.08)', border: '0.5px solid rgba(192,64,64,0.2)', borderRadius: 4, fontSize: 12, color: '#c04040', textAlign: 'center' }}>
                ✗ REJECTED {waiver.rejection_reason ? `— ${waiver.rejection_reason}` : ''}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
