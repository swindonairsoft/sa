// pages/events/[id].js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'
import { apiFetch } from '@/lib/apiFetch'
import { getEventById, getEventBookingCount } from '@/lib/events'
import { hasValidWaiver } from '@/lib/waivers'

const PACKAGES = [
  { id: 'walkon', label: 'Walk-On',      sub: 'Own kit',             priceKey: 'price_walkon' },
  { id: 'hire',   label: 'Hire Package', sub: 'RIF + unlimited BBs', priceKey: 'price_hire'   },
]
const ADDONS = [
  { id: 'pyro', label: 'Pyro Pack',      price: 1000, note: '18+ only — UK firework regulations apply' },
  { id: 'ammo', label: 'Extra Ammo Bag', price: 500,  note: 'Walk-on players only' },
]

export default function EventDetailPage({ session, event, bookingCount = 0, waiverOk = false }) {
  const router   = useRouter()
  const [pkg,     setPkg]     = useState('walkon')
  const [players, setPlayers] = useState(1)
  const [addons,  setAddons]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [showMap, setShowMap] = useState(false)

  if (!event) return (
    <Layout session={session} title="Event Not Found">
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ color: '#4a5e42' }}>Event not found.</p>
        <Link href="/events" style={{ color: '#6aaa48', textDecoration: 'none', marginTop: 12, display: 'inline-block' }}>← Back to events</Link>
      </div>
    </Layout>
  )

  const spotsLeft  = event.capacity - bookingCount
  const eventDate  = new Date(event.event_date)
  const priceKey   = PACKAGES.find(p => p.id === pkg)?.priceKey
  const unitPrice  = event[priceKey] || 0
  const addonTotal = addons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price || 0), 0)
  const totalPence = (unitPrice * players) + (addonTotal * players)

  const handleBook = async () => {
    if (!session) return router.push('/auth/login')
    if (!waiverOk) return router.push('/profile/waiver')
    setLoading(true); setError('')
    try {
      const res = await apiFetch('/api/bookings/create', {
        method: 'POST',
        body: JSON.stringify({ eventId: event.id, pkg, players, addons }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      window.location.href = data.checkoutUrl
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const TYPE_COLORS = { outdoor: '#1a3a12', indoor: '#12243a', milsim: '#2a3518', cqb: '#1a2030' }

  return (
    <Layout session={session} title={event.title}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
        <Link href="/events" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          ← Back to events
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }} className="md:grid-cols-2">

          {/* Left — event info */}
          <div>
            {/* Hero banner */}
            <div style={{ height: 180, borderRadius: 6, marginBottom: 20, background: `linear-gradient(135deg, ${TYPE_COLORS[event.event_type] || '#0f1a0f'}, #0a0f0a)`, border: '0.5px solid #1e2a1a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 20 }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(40,60,25,0.06) 0px, rgba(40,60,25,0.06) 2px, transparent 2px, transparent 12px)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 6 }}>{event.event_type?.toUpperCase()}</div>
                <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 2, lineHeight: 1 }}>{event.title}</h1>
              </div>
            </div>

            {/* Details */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20, marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {[
                  ['Date',        format(eventDate, 'EEEE d MMMM yyyy')],
                  ['Time',        `${event.start_time} – ${event.end_time}`],
                  ['Location',    event.location],
                  ['Type',        event.event_type],
                  ['Capacity',    `${event.capacity} players`],
                  ['Spots left',  spotsLeft > 0 ? `${spotsLeft} remaining` : 'SOLD OUT'],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '0.5px solid #1e2a1a' }}>
                    <td style={{ padding: '8px 0', color: '#4a5e42', width: '35%', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1 }}>{label.toUpperCase()}</td>
                    <td style={{ padding: '8px 0', color: '#c0d0b8', fontSize: 13, fontWeight: 500 }}>{value}</td>
                  </tr>
                ))}
              </table>
            </div>

            {/* Google Maps */}
            {(event.maps_url || event.maps_embed) && (
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a' }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2 }}>📍 LOCATION MAP</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowMap(!showMap)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer' }}>
                      {showMap ? 'HIDE MAP' : 'SHOW MAP'}
                    </button>
                    {event.maps_url && (
                      <a href={event.maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'rgba(72,136,200,0.1)', color: '#4888c8', border: '0.5px solid rgba(72,136,200,0.25)', textDecoration: 'none' }}>
                        GET DIRECTIONS →
                      </a>
                    )}
                  </div>
                </div>
                {showMap && event.maps_embed && (
                  <iframe
                    src={event.maps_embed}
                    width="100%"
                    height="280"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    title="Event location"
                  />
                )}
                {showMap && !event.maps_embed && event.maps_url && (
                  <div style={{ padding: 16, textAlign: 'center' }}>
                    <a href={event.maps_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4888c8', fontSize: 13 }}>Open in Google Maps →</a>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20 }}>
                <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>EVENT BRIEFING</h3>
                <p style={{ fontSize: 13, color: '#6a7a64', lineHeight: 1.7, margin: 0 }}>{event.description}</p>
              </div>
            )}
          </div>

          {/* Right — booking widget */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20 }}>
              <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: '#e0e8d8', letterSpacing: 2, marginBottom: 16 }}>BOOK THIS EVENT</h2>

              {/* Warnings */}
              {!session && (
                <div style={{ background: 'rgba(200,160,48,0.08)', border: '0.5px solid rgba(200,160,48,0.25)', borderRadius: 4, padding: '10px 12px', marginBottom: 14 }}>
                  <p style={{ fontSize: 11, color: '#a08030', margin: 0 }}>
                    <strong>Log in to book.</strong>{' '}
                    <Link href="/auth/login" style={{ color: '#c8a030' }}>Log in</Link> or{' '}
                    <Link href="/auth/register" style={{ color: '#c8a030' }}>register</Link>
                  </p>
                </div>
              )}
              {session && !waiverOk && (
                <div style={{ background: 'rgba(200,160,48,0.08)', border: '0.5px solid rgba(200,160,48,0.25)', borderRadius: 4, padding: '10px 12px', marginBottom: 14 }}>
                  <p style={{ fontSize: 11, color: '#a08030', margin: 0 }}>
                    ⚠ <strong>Waiver required.</strong>{' '}
                    <Link href="/profile/waiver" style={{ color: '#c8a030' }}>Sign waiver →</Link>
                  </p>
                </div>
              )}

              {/* Package selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 6 }}>PACKAGE</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {PACKAGES.map(p => (
                    <button key={p.id} onClick={() => setPkg(p.id)} style={{ padding: '10px 8px', borderRadius: 4, cursor: 'pointer', background: pkg === p.id ? 'rgba(106,170,72,0.1)' : 'transparent', border: `0.5px solid ${pkg === p.id ? 'rgba(106,170,72,0.4)' : '#1e2a1a'}`, textAlign: 'left', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: pkg === p.id ? '#6aaa48' : '#8a9a84' }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: '#4a5e42', marginTop: 2 }}>{p.sub}</div>
                      <div style={{ fontSize: 14, color: '#6aaa48', fontWeight: 600, marginTop: 4 }}>£{((event[p.priceKey]||0)/100).toFixed(0)}pp</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Players */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 6 }}>NUMBER OF PLAYERS</label>
                <select value={players} onChange={e => setPlayers(Number(e.target.value))} style={{ width: '100%', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, color: '#e0e8d8', fontSize: 13, padding: '9px 12px' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} player{n>1?'s':''}</option>)}
                </select>
              </div>

              {/* Add-ons */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 6 }}>ADD-ONS (OPTIONAL)</label>
                {ADDONS.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '0.5px solid #1a2218' }}>
                    <input type="checkbox" id={`addon-${a.id}`} checked={addons.includes(a.id)} onChange={e => setAddons(prev => e.target.checked ? [...prev, a.id] : prev.filter(x => x !== a.id))} style={{ accentColor: '#6aaa48', width: 14, height: 14, cursor: 'pointer' }} />
                    <label htmlFor={`addon-${a.id}`} style={{ flex: 1, cursor: 'pointer' }}>
                      <div style={{ fontSize: 12, color: '#8a9a84' }}>{a.label}</div>
                      <div style={{ fontSize: 10, color: '#3a4a34' }}>{a.note}</div>
                    </label>
                    <span style={{ fontSize: 12, color: '#6aaa48', fontWeight: 600 }}>+£{(a.price/100).toFixed(0)}pp</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ borderTop: '0.5px solid #1e2a1a', paddingTop: 14, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', marginBottom: 2 }}>TOTAL ({players} player{players>1?'s':''})</div>
                  <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 30, color: '#6aaa48', letterSpacing: 1 }}>£{(totalPence/100).toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: '#2e3e28' }}>
                  <div>Secure payment</div>
                  <div>via Stripe</div>
                </div>
              </div>

              {error && <p style={{ fontSize: 12, color: '#c04040', marginBottom: 10 }}>{error}</p>}

              <button onClick={handleBook} disabled={loading || spotsLeft === 0 || (session && !waiverOk)} style={{ width: '100%', padding: '12px', background: spotsLeft === 0 ? '#1e2a1a' : '#5a8c3a', color: spotsLeft === 0 ? '#3a4a34' : '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: spotsLeft === 0 ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}>
                {loading ? 'PROCESSING…' : spotsLeft === 0 ? 'SOLD OUT' : 'PROCEED TO CHECKOUT →'}
              </button>

              <p style={{ fontSize: 10, color: '#2e3e28', textAlign: 'center', marginTop: 10 }}>Instant confirmation email sent on payment</p>
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
    let waiverOk = false
    try {
      const { getSessionFromRequest } = await import('@/lib/supabase')
      const session = await getSessionFromRequest(ctx.req)
      if (session?.user?.id) waiverOk = await hasValidWaiver(session.user.id)
    } catch {}
    return { props: { event, bookingCount, waiverOk } }
  } catch {
    return { props: { event: null, bookingCount: 0, waiverOk: false } }
  }
}
