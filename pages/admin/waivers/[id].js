// pages/admin/waivers/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
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
  const [waiver,    setWaiver]   = useState(null)
  const [player,    setPlayer]   = useState(null)
  const [loading,   setLoading]  = useState(true)
  const [authState, setAuth]     = useState('checking')
  const [msg,       setMsg]      = useState('')
  const [acting,    setActing]   = useState(false)
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
    setLoading(true)
    const res = await apiFetch(`/api/admin/waivers/${id}?type=${type || 'new'}`)
    const d = await res.json()
    setWaiver(d.waiver || null)
    setPlayer(d.player || null)
    setLoading(false)
  }

  const handleAction = async (action) => {
    if (acting) return
    setActing(true)
    const reason = action === 'reject' ? (prompt('Reason for rejection (optional):') || '') : ''

    // Use the actual waiver ID from the loaded waiver object
    const waiverIdToUse = waiver?.id
    if (!waiverIdToUse) {
      setMsg('Error: could not determine waiver ID')
      setActing(false)
      return
    }

    const res = await apiFetch(`/api/admin/waivers/${action}`, {
      method: 'POST',
      body: JSON.stringify({ id: waiverIdToUse, isEdit, reason }),
    })
    const d = await res.json()
    setActing(false)

    if (res.ok) {
      setMsg(`✓ Waiver ${action}d successfully.`)
      // Reload the waiver to reflect new status
      loadWaiver()
    } else {
      setMsg(`Error: ${d.error || 'Unknown error'}`)
    }
  }

  if (authState !== 'ok') return (
    <AdminLayout session={session} title="View Waiver">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>LOADING…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout session={session} title="View Waiver">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>

        <Link href="/admin" style={{ fontSize: 11, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
          ← Admin dashboard
        </Link>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2, marginBottom: 20 }}>
          {isEdit ? 'WAIVER EDIT REVIEW' : 'WAIVER REVIEW'}
        </h1>

        {msg && (
          <div style={{
            fontSize: 12,
            color: msg.startsWith('Error') ? '#c04040' : '#6aaa48',
            marginBottom: 16, padding: '10px 14px',
            background: msg.startsWith('Error') ? 'rgba(192,64,64,0.08)' : 'rgba(106,170,72,0.08)',
            border: `0.5px solid ${msg.startsWith('Error') ? 'rgba(192,64,64,0.2)' : 'rgba(106,170,72,0.2)'}`,
            borderRadius: 4,
          }}>
            {msg}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#4a5e42', fontSize: 12 }}>Loading waiver…</p>
        ) : !waiver ? (
          <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 32, textAlign: 'center' }}>
            <p style={{ color: '#c04040', fontSize: 13 }}>Waiver not found. It may have already been reviewed.</p>
            <Link href="/admin" style={{ color: '#6aaa48', textDecoration: 'none', fontSize: 12, marginTop: 12, display: 'inline-block' }}>← Back to admin</Link>
          </div>
        ) : (
          <>
            {/* Status banner */}
            <div style={{
              padding: '10px 16px', borderRadius: 4, marginBottom: 16,
              background: waiver.status === 'approved' ? 'rgba(106,170,72,0.08)' : waiver.status === 'rejected' ? 'rgba(192,64,64,0.08)' : 'rgba(200,160,48,0.08)',
              border: `0.5px solid ${waiver.status === 'approved' ? 'rgba(106,170,72,0.25)' : waiver.status === 'rejected' ? 'rgba(192,64,64,0.25)' : 'rgba(200,160,48,0.25)'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: waiver.status === 'approved' ? '#6aaa48' : waiver.status === 'rejected' ? '#c04040' : '#c8a030' }}>
                STATUS: {waiver.status?.toUpperCase().replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 10, color: '#3a4a34' }}>ID: {waiver.id}</span>
            </div>

            {/* Player info */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 12 }}>PLAYER DETAILS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {[
                  ['Player',    player?.full_name || '—'],
                  ['Email',     player?.email || '—'],
                  ['Submitted', waiver.submitted_at ? format(new Date(waiver.submitted_at), 'd MMM yyyy HH:mm') : '—'],
                  ['Under 18',  waiver.is_under18 ? '⚠ YES' : 'No'],
                  ['DOB',       waiver.date_of_birth ? format(new Date(waiver.date_of_birth), 'd MMM yyyy') : '—'],
                  ['E-Signed',  waiver.esign_name || '—'],
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
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#c8a030', letterSpacing: 2, marginBottom: 12 }}>⚠ UNDER 18 — PARENT / GUARDIAN CONSENT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {[
                    ['Parent Name',  waiver.parent_data.parentName],
                    ['Parent Email', waiver.parent_data.parentEmail],
                    ['Parent Phone', waiver.parent_data.parentPhone],
                    ['Signature',    waiver.parent_data.parentSignature],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#8a6020', letterSpacing: 1, marginBottom: 3 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: '#c8a030', fontStyle: label === 'Signature' ? 'italic' : 'normal' }}>{value || '—'}</div>
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

            {/* Sections agreed */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 12 }}>WAIVER SECTIONS</div>
              {Object.keys(SECTION_LABELS).map(key => {
                const val = waiver.sections_agreed?.[key]
                const blocked = key === 'pyro' && waiver.is_under18
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #1a2218' }}>
                    <span style={{ fontSize: 16, color: blocked ? '#5a3a3a' : val ? '#6aaa48' : '#3a3a3a', flexShrink: 0, width: 20 }}>
                      {blocked ? '🚫' : val ? '✓' : '✗'}
                    </span>
                    <span style={{ fontSize: 12, color: blocked ? '#5a3a3a' : val ? '#8a9a84' : '#4a4a4a' }}>
                      {SECTION_LABELS[key]}
                      {blocked && <span style={{ fontSize: 9, color: '#c04040', marginLeft: 8, fontFamily: '"JetBrains Mono", monospace' }}>BLOCKED — U18</span>}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* E-signature */}
            {waiver.esign_name && (
              <div style={{ background: 'rgba(106,170,72,0.04)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 6, padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 8 }}>ELECTRONIC SIGNATURE</div>
                <div style={{ fontSize: 16, color: '#6aaa48', fontStyle: 'italic', marginBottom: 4 }}>{waiver.esign_name}</div>
                <div style={{ fontSize: 11, color: '#3a4a34' }}>{waiver.esign_date || (waiver.signed_at ? format(new Date(waiver.signed_at), 'd MMMM yyyy') : '—')}</div>
              </div>
            )}

            {/* Action buttons */}
            {(waiver.status === 'pending_approval' || waiver.status === 'pending') && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={acting}
                  style={{ flex: 1, padding: '13px', background: acting ? '#2e4a2e' : '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: acting ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}
                >
                  {acting ? 'PROCESSING…' : '✓ APPROVE WAIVER'}
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={acting}
                  style={{ padding: '13px 24px', background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.3)', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  REJECT
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
