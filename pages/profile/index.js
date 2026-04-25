// pages/profile/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'

export default function ProfilePage({ session }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [waiver, setWaiver] = useState(null)
  const [gameDays, setGameDays] = useState(0)
  const [ukara, setUkara] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    Promise.all([
      fetch('/api/profile/get').then(r => r.json()),
      fetch('/api/profile/bookings').then(r => r.json()),
      fetch('/api/waiver/get').then(r => r.json()),
      fetch('/api/profile/gamedays').then(r => r.json()),
      fetch('/api/ukara/status').then(r => r.json()),
    ]).then(([p, b, w, g, u]) => {
      setProfile(p.profile); setForm(p.profile || {})
      setBookings(b.bookings || [])
      setWaiver(w.waiver)
      setGameDays(g.count || 0)
      setUkara(u.ukara)
      setLoading(false)
    })
  }, [session])

  const handleSave = async () => {
    setSaving(true); setSaveMsg('')
    const res = await fetch('/api/profile/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { setSaveMsg('Changes submitted for admin approval.'); setEditing(false) }
    else setSaveMsg(data.error || 'Error saving')
  }

  if (!session || loading) return (
    <Layout session={session} title="My Profile">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p style={{ color: '#4a5e42' }}>Loading…</p>
      </div>
    </Layout>
  )

  const waiverStatus = waiver?.status || 'not_submitted'

  return (
    <Layout session={session} title="My Profile">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div style={{ marginBottom: 28 }}>
          <div className="section-eyebrow">PLAYER ACCOUNT</div>
          <h1 className="section-title" style={{ fontSize: 28 }}>MY PROFILE</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Profile details */}
            <div className="tac-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2 }}>PERSONAL DETAILS</h2>
                {!editing
                  ? <button onClick={() => setEditing(true)} className="btn-ghost" style={{ padding: '5px 12px', fontSize: 10 }}>EDIT</button>
                  : <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '5px 12px', fontSize: 10 }}>
                        {saving ? 'SAVING…' : 'SAVE'}
                      </button>
                      <button onClick={() => { setEditing(false); setForm(profile) }} className="btn-secondary" style={{ padding: '5px 12px', fontSize: 10 }}>CANCEL</button>
                    </div>
                }
              </div>
              {saveMsg && <p style={{ fontSize: 11, color: '#c8a030', marginBottom: 10 }}>{saveMsg}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'full_name',     label: 'Full Name',      type: 'text'  },
                  { key: 'email',         label: 'Email',          type: 'email' },
                  { key: 'phone',         label: 'Phone Number',   type: 'tel'   },
                  { key: 'date_of_birth', label: 'Date of Birth',  type: 'date'  },
                  { key: 'address_line1', label: 'Address Line 1', type: 'text'  },
                  { key: 'address_line2', label: 'Address Line 2', type: 'text'  },
                  { key: 'city',          label: 'City / Town',    type: 'text'  },
                  { key: 'postcode',      label: 'Postcode',       type: 'text'  },
                ].map(f => (
                  <div key={f.key}>
                    <label className="field-label">{f.label}</label>
                    {editing
                      ? <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="field-input" />
                      : <div style={{ fontSize: 13, color: '#c0d0b8', padding: '8px 0', borderBottom: '0.5px solid #1e2a1a' }}>
                          {profile?.[f.key] || <span style={{ color: '#3a4a34' }}>—</span>}
                        </div>
                    }
                  </div>
                ))}
              </div>
              {editing && <p style={{ fontSize: 10, color: '#4a5e42', marginTop: 12 }}>⚠ Profile changes require admin approval before taking effect.</p>}
            </div>

            {/* Bookings */}
            <div className="tac-card" style={{ padding: 20 }}>
              <h2 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>MY BOOKINGS</h2>
              {bookings.length === 0
                ? <p style={{ fontSize: 12, color: '#3a4a34' }}>No bookings yet. <Link href="/events" style={{ color: '#6aaa48' }}>Browse events →</Link></p>
                : bookings.slice(0, 10).map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #1e2a1a', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#c0d0b8', fontWeight: 500 }}>{b.events?.title || 'Event'}</div>
                      <div style={{ fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', marginTop: 2 }}>
                        {b.events?.event_date ? format(new Date(b.events.event_date), 'EEE d MMM yyyy') : ''}
                        {' · '}{b.player_count} player{b.player_count > 1 ? 's' : ''} · {b.package_type}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#6aaa48', fontWeight: 600 }}>£{((b.amount_paid || 0) / 100).toFixed(2)}</span>
                      <span className={`badge ${b.status === 'confirmed' ? 'badge-paid' : b.status === 'cancelled' ? 'badge-sold' : 'badge-pend'}`}>
                        {b.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Waiver status */}
            <div className="tac-card" style={{ padding: 16 }}>
              <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>WAIVER STATUS</h3>
              <div style={{
                padding: '10px 12px', borderRadius: 4, marginBottom: 10,
                background: waiverStatus === 'approved' ? 'rgba(106,170,72,0.08)' : 'rgba(200,160,48,0.08)',
                border: `0.5px solid ${waiverStatus === 'approved' ? 'rgba(106,170,72,0.3)' : 'rgba(200,160,48,0.3)'}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: waiverStatus === 'approved' ? '#6aaa48' : '#c8a030' }}>
                  {waiverStatus === 'approved'    ? '✓ APPROVED'
                    : waiverStatus === 'pending_approval' ? '⏳ PENDING REVIEW'
                    : waiverStatus === 'rejected'  ? '✗ REJECTED'
                    : 'NOT SUBMITTED'}
                </div>
                {waiver?.approved_at && <div style={{ fontSize: 10, color: '#3a4a34', marginTop: 2 }}>Approved {format(new Date(waiver.approved_at), 'd MMM yyyy')}</div>}
              </div>
              <Link href="/profile/waiver" className="btn-ghost" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '8px', fontSize: 11 }}>
                {waiverStatus === 'approved' ? 'VIEW / UPDATE WAIVER' : 'SIGN WAIVER'}
              </Link>
            </div>

            {/* Game days */}
            <div className="tac-card" style={{ padding: 16 }}>
              <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>GAME DAYS (LAST 12 MONTHS)</h3>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 40, color: gameDays >= 3 ? '#6aaa48' : '#c8a030', letterSpacing: 1, lineHeight: 1 }}>{gameDays}</div>
              <div style={{ fontSize: 10, color: '#3a4a34', marginTop: 4 }}>
                {gameDays >= 3 ? '✓ Eligible for UKARA' : `${3 - gameDays} more needed for UKARA`}
              </div>
            </div>

            {/* UKARA */}
            <div className="tac-card" style={{ padding: 16 }}>
              <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>UKARA</h3>
              {ukara?.status === 'approved'
                ? <>
                    <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, color: '#6aaa48', letterSpacing: 2 }}>{ukara.ukara_number}</div>
                    <div style={{ fontSize: 10, color: '#3a4a34', marginTop: 2 }}>Expires {format(new Date(ukara.expires_at), 'd MMM yyyy')}</div>
                  </>
                : <>
                    <p style={{ fontSize: 11, color: '#3a4a34', marginBottom: 10 }}>
                      {ukara?.status === 'pending_review' ? 'Application under review.' : 'Apply for UKARA registration — £5/year.'}
                    </p>
                    {ukara?.status !== 'pending_review' && (
                      <Link href="/profile/ukara" className="btn-ghost" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '8px', fontSize: 11 }}>
                        APPLY FOR UKARA
                      </Link>
                    )}
                  </>
              }
            </div>

            {/* Quick links */}
            <div className="tac-card" style={{ padding: 16 }}>
              <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>QUICK LINKS</h3>
              {[
                { href: '/events', label: 'Browse Events' },
                { href: '/rules', label: 'Site Rules' },
                { href: '/auth/change-password', label: 'Change Password' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 12, color: '#4a5e42', padding: '6px 0', borderBottom: '0.5px solid #1e2a1a', textDecoration: 'none' }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
