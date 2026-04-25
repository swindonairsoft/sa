// pages/profile/ukara.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'

export default function UkaraPage({ session }) {
  const router = useRouter()
  const [eligibility, setEligibility] = useState(null)
  const [existing,    setExisting]    = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [applying,    setApplying]    = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    Promise.all([
      fetch('/api/ukara/eligibility').then(r => r.json()),
      fetch('/api/ukara/status').then(r => r.json()),
      fetch('/api/profile/get').then(r => r.json()),
    ]).then(([e, s, p]) => {
      setEligibility(e)
      setExisting(s.ukara)
      setProfile(p.profile)
      setLoading(false)
    })
  }, [session])

  const handleApply = async () => {
    setApplying(true); setError('')
    try {
      const res = await fetch('/api/ukara/apply', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Application failed')
      window.location.href = data.checkoutUrl
    } catch (e) {
      setError(e.message); setApplying(false)
    }
  }

  if (loading) return <Layout session={session} title="UKARA Application"><div className="max-w-3xl mx-auto px-4 py-20 text-center"><p style={{ color: '#4a5e42' }}>Loading…</p></div></Layout>

  return (
    <Layout session={session} title="UKARA Application">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/profile" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>← Back to profile</Link>

        <div className="section-eyebrow">PLAYER ACCOUNT</div>
        <h1 className="section-title" style={{ fontSize: 28, marginBottom: 6 }}>UKARA APPLICATION</h1>
        <p style={{ fontSize: 13, color: '#4a5e42', marginBottom: 24, lineHeight: 1.6 }}>
          UKARA (United Kingdom Airsoft Retailers Association) registration is required to purchase RIFs (Replica Imitation Firearms) from UK retailers.
          Swindon Airsoft is a registered UKARA site — we can verify your eligibility.
        </p>

        {/* Current UKARA status */}
        {existing?.status === 'approved' && (
          <div style={{ background: 'rgba(106,170,72,0.08)', border: '0.5px solid rgba(106,170,72,0.3)', borderRadius: 6, padding: 20, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 8 }}>YOUR UKARA NUMBER</div>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, color: '#6aaa48', letterSpacing: 4 }}>{existing.ukara_number}</div>
            <div style={{ fontSize: 11, color: '#3a4a34', marginTop: 4 }}>Valid until {existing.expires_at ? new Date(existing.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</div>
          </div>
        )}

        {existing?.status === 'pending_review' && (
          <div style={{ background: 'rgba(200,160,48,0.08)', border: '0.5px solid rgba(200,160,48,0.3)', borderRadius: 6, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: '#c8a030' }}>⏳ Your application is under review. We'll email you once approved (within 5 working days).</p>
          </div>
        )}

        {/* Eligibility check */}
        <div className="tac-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>ELIGIBILITY CHECK</div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {/* Game days */}
            <div style={{ flex: '1 1 160px', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, padding: 14, textAlign: 'center' }}>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, color: (eligibility?.gameDays || 0) >= 3 ? '#6aaa48' : '#c8a030', letterSpacing: 1 }}>
                {eligibility?.gameDays || 0}
              </div>
              <div style={{ fontSize: 10, color: '#3a4a34', marginTop: 2 }}>GAME DAYS (LAST 12 MONTHS)</div>
              <div style={{ fontSize: 10, color: (eligibility?.gameDays || 0) >= 3 ? '#6aaa48' : '#c8a030', marginTop: 4 }}>
                {(eligibility?.gameDays || 0) >= 3 ? '✓ Requirement met (3+)' : `${eligibility?.shortfall || 0} more needed`}
              </div>
            </div>

            {/* Requirements */}
            <div style={{ flex: '2 1 200px' }}>
              {[
                { label: 'Attended 3+ game days at Swindon Airsoft in last 12 months', met: (eligibility?.gameDays || 0) >= 3 },
                { label: 'UK resident (18+)', met: true },
                { label: 'Valid profile with address and contact details', met: !!(profile?.address_line1 && profile?.phone) },
                { label: 'Signed waiver on file', met: eligibility?.waiverOk },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderBottom: '0.5px solid #1e2a1a' }}>
                  <span style={{ color: r.met ? '#6aaa48' : '#c04040', fontSize: 14, flexShrink: 0 }}>{r.met ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 12, color: r.met ? '#8a9a84' : '#6a4040' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application form / cost */}
        {!existing?.status || existing?.status === 'rejected' ? (
          <div className="tac-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>APPLICATION FEE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#6aaa48', letterSpacing: 1 }}>£5.00</div>
                <div style={{ fontSize: 11, color: '#3a4a34' }}>Annual UKARA registration fee · valid 12 months</div>
              </div>
              <div style={{ fontSize: 10, color: '#2e3e28', textAlign: 'right' }}>
                <div>Secure payment</div><div>via Stripe</div>
              </div>
            </div>

            <div style={{ background: 'rgba(106,170,72,0.05)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 4, padding: '10px 12px', marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: '#4a5e42', lineHeight: 1.6 }}>
                Once payment is received, our team will review your application and verify your game day attendance. Your UKARA number will be emailed to you within 5 working days.
              </p>
            </div>

            {error && <p style={{ fontSize: 12, color: '#c04040', marginBottom: 10 }}>{error}</p>}

            <button
              onClick={handleApply}
              disabled={!eligibility?.eligible || applying}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: eligibility?.eligible ? 1 : 0.5 }}
            >
              {applying ? 'REDIRECTING TO PAYMENT…' : eligibility?.eligible ? 'APPLY & PAY £5.00 →' : `NOT YET ELIGIBLE (${eligibility?.shortfall} MORE GAME DAYS NEEDED)`}
            </button>
          </div>
        ) : null}

        <div style={{ marginTop: 20 }}>
          <Link href="/ukara-info" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none' }}>
            What is UKARA and why do I need it? →
          </Link>
        </div>
      </div>
    </Layout>
  )
}
