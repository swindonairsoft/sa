// pages/events/[id].js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'
import { getEventById, getEventBookingCount } from '@/lib/events'
import { hasValidWaiver } from '@/lib/waivers'
import { createBooking } from '@/lib/bookings'
import { getProfile } from '@/lib/players'

const PACKAGES = [
  { id: 'walkon',   label: 'Walk-On',       sub: 'Own kit',             priceKey: 'price_walkon' },
  { id: 'hire',     label: 'Hire Package',  sub: 'RIF + unlimited BBs', priceKey: 'price_hire'   },
]

const ADDONS = [
  { id: 'pyro',  label: 'Pyro Pack',     price: 1000, note: '18+ only — UK firework regulations apply' },
  { id: 'ammo',  label: 'Extra Ammo Bag', price: 500,  note: 'Hire package players only' },
]

export default function EventDetailPage({ session, event, bookingCount = 0, waiverOk = false }) {
  const router = useRouter()
  const [pkg, setPkg]       = useState('walkon')
  const [players, setPlayers] = useState(1)
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  if (!event) return (
    <Layout session={session} title="Event Not Found">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p style={{ color: '#4a5e42' }}>Event not found.</p>
        <Link href="/events" className="btn-ghost" style={{ marginTop: 16, textDecoration: 'none', display: 'inline-block' }}>← Back to events</Link>
      </div>
    </Layout>
  )

  const spotsLeft   = event.capacity - bookingCount
  const eventDate   = new Date(event.event_date)
  const priceKey    = PACKAGES.find(p => p.id === pkg)?.priceKey
  const unitPrice   = event[priceKey] || 0
  const addonTotal  = addons.reduce((sum, id) => sum + (ADDONS.find(a => a.id === id)?.price || 0), 0)
  const totalPence  = (unitPrice * players) + (addonTotal * players)

  const handleBook = async () => {
    if (!session) return router.push('/auth/login')
    if (!waiverOk) return router.push('/profile/waiver')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, pkg, players, addons }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout session={session} title={event.title}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/events" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          ← Back to events
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left — event info */}
          <div style={{ gridColumn: 'span 3' }}>
            {/* Hero banner */}
            <div style={{
              height: 200, borderRadius: 6, marginBottom: 24,
              background: 'linear-gradient(135deg, #0f2210 0%, #1a3a12 50%, #0e1a0a 100%)',
              border: '0.5px solid #1e2a1a', position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'flex-end', padding: 20,
            }}>
              <div className="camo-bg" style={{ position: 'absolute', inset: 0 }} />
              <div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 6 }}>
                  {event.event_type?.toUpperCase()}
                </div>
                <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 2, lineHeight: 1, position: 'relative' }}>
                  {event.title}
                </h1>
              </div>
            </div>

            {/* Details */}
            <div className="tac-card" style={{ padding: 20, marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                {[
                  ['Date', format(eventDate, 'EEEE d MMMM yyyy')],
                  ['Time', `${event.start_time} – ${event.end_time}`],
                  ['Location', event.location],
                  ['Type', event.event_type],
                  ['Capacity', `${event.capacity} players`],
                  ['Spots Left', spotsLeft > 0 ? `${spotsLeft} remaining` : 'SOLD OUT'],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '0.5px solid #1e2a1a' }}>
                    <td style={{ padding: '8px 0', color: '#4a5e42', width: '40%', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1 }}>
                      {label.toUpperCase()}
                    </td>
                    <td style={{ padding: '8px 0', color: '#c0d0b8', fontWeight: 500 }}>{value}</td>
                  </tr>
                ))}
              </table>
            </div>

            {event.description && (
              <div className="tac-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 11, color: '#4a5e42', letterSpacing: 2, fontFamily: '"JetBrains Mono", monospace', marginBottom: 10 }}>EVENT BRIEFING</h3>
                <p style={{ fontSize: 13, color: '#6a7a64', lineHeight: 1.7 }}>{event.description}</p>
              </div>
            )}
          </div>

          {/* Right — booking widget */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="tac-card" style={{ padding: 20 }}>
              <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: '#e0e8d8', letterSpacing: 2, marginBottom: 16 }}>BOOK THIS EVENT</h2>

              {/* Waiver warning */}
              {!session && (
                <div style={{ background: 'rgba(200,160,48,0.08)', border: '0.5px solid rgba(200,160,48,0.25)', borderRadius: 4, padding: '10px 12px', marginBottom: 14 }}>
                  <p style={{ fontSize: 11, color: '#a08030' }}>
                    <strong>You must be logged in</strong> to book.{' '}
                    <Link href="/auth/login" style={{ color: '#c8a030' }}>Log in</Link> or{' '}
                    <Link href="/auth/register" style={{ color: '#c8a030' }}>register</Link>.
                  </p>
                </div>
              )}
              {session && !waiverOk && (
                <div style={{ background: 'rgba(200,160,48,0.08)', border: '0.5px solid rgba(200,160,48,0.25)', borderRadius: 4, padding: '10px 12px', marginBottom: 14 }}>
                  <p style={{ fontSize: 11, color: '#a08030' }}>
                    ⚠ <strong>Waiver required</strong> before booking.{' '}
                    <Link href="/profile/waiver" style={{ color: '#c8a030' }}>Sign waiver →</Link>
                  </p>
                </div>
              )}

              {/* Package selector */}
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">PACKAGE</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {PACKAGES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPkg(p.id)}
                      style={{
                        padding: '10px 8px', borderRadius: 4, cursor: 'pointer',
                        background: pkg === p.id ? 'rgba(106,170,72,0.1)' : 'transparent',
                        border: `0.5px solid ${pkg === p.id ? 'rgba(106,170,72,0.4)' : '#1e2a1a'}`,
                        textAlign: 'left', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: pkg === p.id ? '#6aaa48' : '#8a9a84' }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: '#4a5e42', marginTop: 2 }}>{p.sub}</div>
                      <div style={{ fontSize: 13, color: '#6aaa48', fontWeight: 600, marginTop: 4 }}>
                        £{((event[p.priceKey] || 0) / 100).toFixed(0)}pp
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Players */}
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">NUMBER OF PLAYERS</label>
                <select
                  value={players}
                  onChange={e => setPlayers(Number(e.target.value))}
                  className="field-input"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} player{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Add-ons */}
              <div style={{ marginBottom: 16 }}>
                <label className="field-label">ADD-ONS (OPTIONAL)</label>
                {ADDONS.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid #1a2218' }}>
                    <input
                      type="checkbox"
                      id={`addon-${a.id}`}
                      checked={addons.includes(a.id)}
                      onChange={e => setAddons(prev =>
                        e.target.checked ? [...prev, a.id] : prev.filter(x => x !== a.id)
                      )}
                      style={{ accentColor: '#6aaa48', width: 14, height: 14 }}
                    />
                    <label htmlFor={`addon-${a.id}`} style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: '#8a9a84' }}>{a.label}</div>
                      <div style={{ fontSize: 10, color: '#4a5e42' }}>{a.note}</div>
                    </label>
                    <span style={{ fontSize: 12, color: '#6aaa48' }}>+£{(a.price / 100).toFixed(0)}pp</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ borderTop: '0.5px solid #1e2a1a', paddingTop: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace' }}>TOTAL ({players} player{players > 1 ? 's' : ''})</div>
                    <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#6aaa48', letterSpacing: 1 }}>
                      £{(totalPence / 100).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 10, color: '#2e3e28' }}>
                    <div>Secure payment</div>
                    <div>via Stripe</div>
                  </div>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 12, color: '#c04040', marginBottom: 10 }}>{error}</p>
              )}

              <button
                onClick={handleBook}
                disabled={loading || spotsLeft === 0 || (session && !waiverOk)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: spotsLeft === 0 ? 0.5 : 1 }}
              >
                {loading ? 'PROCESSING...' : spotsLeft === 0 ? 'SOLD OUT' : 'PROCEED TO CHECKOUT →'}
              </button>

              <p style={{ fontSize: 10, color: '#2e3e28', textAlign: 'center', marginTop: 10 }}>
                Instant confirmation email sent on payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(ctx) {
  const { id } = ctx.params
  try {
    const [event, bookingCount] = await Promise.all([
      getEventById(id),
      getEventBookingCount(id),
    ])

    // Check waiver if user logged in - read token from cookie
    let waiverOk = false
    try {
      const { getSessionFromRequest } = await import('@/lib/supabase')
      const session = await getSessionFromRequest(ctx.req)
      if (session?.user?.id) {
        waiverOk = await hasValidWaiver(session.user.id)
      }
    } catch {}

    return { props: { event, bookingCount, waiverOk } }
  } catch (err) {
    console.error(err)
    return { props: { event: null, bookingCount: 0, waiverOk: false } }
  }
}
