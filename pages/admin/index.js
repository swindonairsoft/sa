// pages/admin/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

export default function AdminDashboard({ session }) {
  const router = useRouter()
  const [stats,       setStats]    = useState(null)
  const [bookings,    setBookings] = useState([])
  const [events,      setEvents]   = useState([])
  const [filterEvent, setFilter]   = useState('all')
  const [waiverQueue, setWaiverQ]  = useState({ new: [], edits: [] })
  const [authState,   setAuthState]= useState('checking')
  const [msg,         setMsg]      = useState('')

  useEffect(() => {
    if (session === undefined) return
    if (session === null) {
      const t = setTimeout(() => router.push('/auth/login?redirect=/admin'), 1000)
      return () => clearTimeout(t)
    }
    apiFetch('/api/admin/verify')
      .then(r => r.json())
      .then(d => {
        if (d.isAdmin) { setAuthState('admin'); loadAll() }
        else { setAuthState('denied'); setTimeout(() => router.push('/'), 2000) }
      })
      .catch(() => setAuthState('denied'))
  }, [session])

  const loadAll = () => {
    Promise.all([
      apiFetch('/api/admin/stats').then(r => r.json()).catch(() => ({})),
      apiFetch('/api/admin/bookings').then(r => r.json()).catch(() => ({ bookings: [] })),
      apiFetch('/api/admin/events').then(r => r.json()).catch(() => ({ events: [] })),
      apiFetch('/api/admin/waivers/pending').then(r => r.json()).catch(() => ({ new: [], edits: [] })),
    ]).then(([s, b, e, w]) => {
      setStats(s); setBookings(b.bookings || []); setEvents(e.events || []); setWaiverQ(w)
    })
  }

  const handleWaiverAction = async (id, isEdit, action) => {
    await apiFetch(`/api/admin/waivers/${action}`, {
      method: 'POST', body: JSON.stringify({ id, isEdit }),
    })
    setMsg(`Waiver ${action}d.`); loadAll()
  }

  const handleResendTicket = async (bookingId) => {
    await apiFetch(`/api/admin/bookings/${bookingId}/resend-ticket`, { method: 'POST' })
    setMsg('Ticket resent to player.')
  }

  const handleRefund = async (bookingId) => {
    if (!confirm('Process full refund for this booking?')) return
    const reason = prompt('Reason for refund (optional):') || ''
    const res = await apiFetch(`/api/admin/bookings/${bookingId}/refund`, {
      method: 'POST', body: JSON.stringify({ reason }),
    })
    const d = await res.json()
    setMsg(res.ok ? 'Refund processed.' : d.error || 'Refund failed.')
    loadAll()
  }

  const filteredBookings = filterEvent === 'all' ? bookings : bookings.filter(b => b.event_id === filterEvent)
  const pendingWaivers = (waiverQueue.new?.length || 0) + (waiverQueue.edits?.length || 0)

  const card = (label, value, color, delta) => (
    <div key={label} style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: '16px 20px' }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 1, marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color, letterSpacing: 1, lineHeight: 1 }}>{value}</div>
      {delta && <div style={{ fontSize: 10, color: '#5a8c3a', marginTop: 4 }}>{delta}</div>}
    </div>
  )

  if (authState === 'checking') return (
    <Layout session={session} title="Admin">
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#4a5e42', letterSpacing: 2 }}>VERIFYING ADMIN ACCESS…</div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#2e3e28' }}>Make sure you are logged in</div>
        </div>
      </div>
    </Layout>
  )

  if (authState === 'denied') return (
    <Layout session={session} title="Access Denied">
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: '#c04040', letterSpacing: 2, marginBottom: 8 }}>ACCESS DENIED</div>
          <p style={{ color: '#4a5e42', fontSize: 13 }}>You do not have admin access. Redirecting…</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="Admin Dashboard">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>🔒 SECURE AREA</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 2 }}>ADMIN DASHBOARD</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { href: '/admin/events',        label: '📅 EVENTS'         },
              { href: '/admin/players',       label: '👥 PLAYERS'        },
              { href: '/admin/ukara',         label: '🎫 UKARA'          },
              { href: '/admin/profile-edits', label: '✏ PROFILE EDITS'  },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 11, padding: '8px 14px', borderRadius: 4, background: 'rgba(106,170,72,0.08)', color: '#8aaa68', border: '0.5px solid rgba(106,170,72,0.25)', textDecoration: 'none', fontWeight: 600 }}>{l.label}</Link>
            ))}
          </div>
        </div>

        {msg && (
          <div style={{ fontSize: 12, color: '#6aaa48', marginBottom: 16, padding: '10px 14px', background: 'rgba(106,170,72,0.08)', border: '0.5px solid rgba(106,170,72,0.2)', borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
            {msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: '#4a5e42', cursor: 'pointer', fontSize: 14 }}>×</button>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
          {card('Revenue this month',  stats ? `£${((stats.monthRevenue||0)/100).toFixed(2)}` : '—', '#6aaa48', stats?.revDelta)}
          {card('Bookings this month', stats?.monthBookings ?? '—', '#e0e8d8', stats ? `+${stats.weekBookings} this week` : null)}
          {card('Pending waivers',     pendingWaivers, pendingWaivers > 0 ? '#c8a030' : '#6aaa48', 'Awaiting review')}
          {card('Pending payments',    stats?.pendingPayments ?? '—', (stats?.pendingPayments || 0) > 0 ? '#c04040' : '#6aaa48', 'Chase required')}
        </div>

        {/* Two column layout: bookings + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

          {/* LEFT — Bookings */}
          <div>
            {/* Waiver approval queue */}
            {pendingWaivers > 0 && (
              <div style={{ background: '#0d1209', border: '0.5px solid rgba(200,160,48,0.3)', borderRadius: 6, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a', background: 'rgba(200,160,48,0.04)' }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#c8a030', letterSpacing: 2 }}>⚠ WAIVER APPROVAL QUEUE</div>
                  <span style={{ fontSize: 9, background: 'rgba(200,160,48,0.15)', color: '#c8a030', padding: '2px 8px', borderRadius: 2, border: '0.5px solid rgba(200,160,48,0.3)' }}>{pendingWaivers} PENDING</span>
                </div>
                {[
                  ...(waiverQueue.new||[]).map(w => ({ ...w, _type: 'new' })),
                  ...(waiverQueue.edits||[]).map(w => ({ ...w, _type: 'edit' })),
                ].map(w => (
                  <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '0.5px solid #0f160e', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 13, color: '#a0b090', fontWeight: 500 }}>{w.profiles?.full_name}</span>
                      <span style={{ fontSize: 9, color: '#4a5e42', marginLeft: 8, fontFamily: '"JetBrains Mono", monospace' }}>{w._type === 'edit' ? 'EDIT' : 'NEW WAIVER'}</span>
                      <div style={{ fontSize: 10, color: '#3a4a34', marginTop: 2 }}>{w.submitted_at ? format(new Date(w.submitted_at), 'd MMM yyyy · HH:mm') : ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/waivers/${w.id}?type=${w._type}`} style={{ fontSize: 9, padding: '4px 9px', borderRadius: 3, background: 'rgba(72,136,200,0.1)', color: '#4888c8', border: '0.5px solid rgba(72,136,200,0.25)', textDecoration: 'none' }}>VIEW</Link>
                      <button onClick={() => handleWaiverAction(w.id, w._type === 'edit', 'approve')} style={{ fontSize: 9, padding: '4px 9px', borderRadius: 3, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer' }}>APPROVE</button>
                      <button onClick={() => handleWaiverAction(w.id, w._type === 'edit', 'reject')}  style={{ fontSize: 9, padding: '4px 9px', borderRadius: 3, background: 'rgba(192,64,64,0.1)',  color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)',  cursor: 'pointer' }}>REJECT</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookings table */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>BOOKINGS — FILTER BY EVENT DATE</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => setFilter('all')} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 2, cursor: 'pointer', background: filterEvent === 'all' ? 'rgba(106,170,72,0.1)' : 'transparent', color: filterEvent === 'all' ? '#6aaa48' : '#4a5e42', border: `0.5px solid ${filterEvent === 'all' ? 'rgba(106,170,72,0.3)' : '#1e2a1a'}` }}>
                    All events ({bookings.length})
                  </button>
                  {events.map(e => {
                    const count = bookings.filter(b => b.event_id === e.id).length
                    return (
                      <button key={e.id} onClick={() => setFilter(e.id)} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 2, cursor: 'pointer', background: filterEvent === e.id ? 'rgba(106,170,72,0.1)' : 'transparent', color: filterEvent === e.id ? '#6aaa48' : '#4a5e42', border: `0.5px solid ${filterEvent === e.id ? 'rgba(106,170,72,0.3)' : '#1e2a1a'}` }}>
                        {format(new Date(e.event_date), 'd MMM')} — {e.title} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                  <thead>
                    <tr>
                      {['PLAYER', 'EVENT', 'PACKAGE', 'PX', 'PAYMENT', 'REF', 'ACTIONS'].map(h => (
                        <th key={h} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', padding: '8px 12px', textAlign: 'left', borderBottom: '0.5px solid #1e2a1a', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => {
                      const isPaid = b.status === 'confirmed'
                      const isRef  = b.status === 'refunded'
                      return (
                        <tr key={b.id} style={{ borderBottom: '0.5px solid rgba(30,42,26,0.4)' }}>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ color: '#c0d0b8', fontWeight: 500, fontSize: 12 }}>{b.profiles?.full_name}</div>
                            <div style={{ fontSize: 10, color: '#3a4a34' }}>{b.profiles?.email}</div>
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: 11, color: '#6a7a64' }}>
                            <div>{b.events?.title}</div>
                            <div style={{ fontSize: 10, color: '#3a4a34' }}>{b.events?.event_date ? format(new Date(b.events.event_date), 'd MMM yyyy') : ''}</div>
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: 11, color: '#6a7a64', whiteSpace: 'nowrap' }}>{b.package_type === 'hire' ? 'Hire' : 'Walk-on'}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, color: '#6a7a64', textAlign: 'center' }}>{b.player_count}</td>
                          <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 2, fontWeight: 500,
                              background: isPaid ? 'rgba(106,170,72,0.15)' : isRef ? 'rgba(72,136,200,0.15)' : 'rgba(200,160,48,0.15)',
                              color:      isPaid ? '#6aaa48'              : isRef ? '#4888c8'               : '#c8a030',
                              border:     `0.5px solid ${isPaid ? 'rgba(106,170,72,0.3)' : isRef ? 'rgba(72,136,200,0.3)' : 'rgba(200,160,48,0.3)'}`,
                            }}>
                              {isPaid ? `PAID £${((b.amount_paid||0)/100).toFixed(2)}` : b.status?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap' }}>{b.booking_ref}</td>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => handleResendTicket(b.id)} style={{ fontSize: 9, padding: '3px 6px', borderRadius: 2, background: 'rgba(72,136,200,0.1)', color: '#4888c8', border: '0.5px solid rgba(72,136,200,0.25)', cursor: 'pointer', whiteSpace: 'nowrap' }}>✉ TICKET</button>
                              <Link href={`/admin/bookings/${b.id}`} style={{ fontSize: 9, padding: '3px 6px', borderRadius: 2, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.25)', textDecoration: 'none', whiteSpace: 'nowrap' }}>EDIT</Link>
                              {isPaid && <button onClick={() => handleRefund(b.id)} style={{ fontSize: 9, padding: '3px 6px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer', whiteSpace: 'nowrap' }}>REFUND</button>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredBookings.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2e3e28', padding: 32, fontSize: 12 }}>No bookings yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Revenue breakdown */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 16 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 12 }}>REVENUE BY PACKAGE</div>
              {[
                { label: 'Walk-on',      pct: stats?.walkonPct  ?? 65, val: stats?.walkonRev  },
                { label: 'Hire package', pct: stats?.hirePct    ?? 35, val: stats?.hireRev    },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6a7a64', marginBottom: 4 }}>
                    <span>{r.label}</span>
                    <span style={{ color: '#6aaa48', fontWeight: 600 }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: '#1e2a1a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.pct}%`, background: '#5a8c3a', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming events quick view */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2 }}>UPCOMING EVENTS</div>
                <Link href="/admin/events" style={{ fontSize: 9, color: '#6aaa48', textDecoration: 'none' }}>MANAGE →</Link>
              </div>
              {events.length === 0
                ? <p style={{ fontSize: 11, color: '#2e3e28' }}>No events. <Link href="/admin/events" style={{ color: '#6aaa48' }}>Create one →</Link></p>
                : events.slice(0, 5).map(e => {
                    const booked = bookings.filter(b => b.event_id === e.id).length
                    const pct = Math.round((booked / e.capacity) * 100)
                    return (
                      <div key={e.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '0.5px solid #1a2218' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, color: '#a0b090', fontWeight: 500 }}>{e.title}</span>
                          <span style={{ fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace' }}>{booked}/{e.capacity}</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#3a4a34', marginBottom: 4 }}>{format(new Date(e.event_date), 'EEE d MMM yyyy')}</div>
                        <div style={{ height: 3, background: '#1e2a1a', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#c04040' : pct >= 70 ? '#c8a030' : '#5a8c3a', borderRadius: 2 }} />
                        </div>
                      </div>
                    )
                  })
              }
              <Link href="/admin/events" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 11, padding: '8px', borderRadius: 3, background: '#5a8c3a', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>+ CREATE NEW EVENT</Link>
            </div>

            {/* Recent bookings quick stats */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 16 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 12 }}>BOOKING STATUS</div>
              {[
                { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: '#6aaa48' },
                { label: 'Pending',   count: bookings.filter(b => b.status === 'pending').length,   color: '#c8a030' },
                { label: 'Refunded',  count: bookings.filter(b => b.status === 'refunded').length,  color: '#4888c8' },
                { label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length, color: '#c04040' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid #1a2218', fontSize: 12 }}>
                  <span style={{ color: '#6a7a64' }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
