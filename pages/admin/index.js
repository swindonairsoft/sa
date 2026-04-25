// pages/admin/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { format } from 'date-fns'

export default function AdminDashboard({ session }) {
  const router = useRouter()
  const [stats, setStats]         = useState(null)
  const [bookings, setBookings]   = useState([])
  const [events, setEvents]       = useState([])
  const [filterEvent, setFilter]  = useState('all')
  const [waiverQueue, setWaiverQ] = useState({ new: [], edits: [] })
  const [loading, setLoading]     = useState(true)
  const [isAdmin, setIsAdmin]     = useState(false)

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    fetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setIsAdmin(true)
      loadAll()
    })
  }, [session])

  const loadAll = () => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/bookings').then(r => r.json()),
      fetch('/api/admin/events').then(r => r.json()),
      fetch('/api/admin/waivers/pending').then(r => r.json()),
    ]).then(([s, b, e, w]) => {
      setStats(s)
      setBookings(b.bookings || [])
      setEvents(e.events || [])
      setWaiverQ(w)
      setLoading(false)
    })
  }

  const handleWaiverAction = async (id, isEdit, action) => {
    await fetch(`/api/admin/waivers/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isEdit }),
    })
    loadAll()
  }

  const handleResendTicket = async (bookingId) => {
    await fetch('/api/admin/bookings/resend-ticket', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
    alert('Ticket resent.')
  }

  const handleRefund = async (bookingId) => {
    if (!confirm('Process full refund for this booking?')) return
    const reason = prompt('Reason for refund (optional):') || ''
    await fetch('/api/admin/bookings/refund', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, reason }),
    })
    loadAll()
    alert('Refund processed.')
  }

  const filteredBookings = filterEvent === 'all'
    ? bookings
    : bookings.filter(b => b.event_id === filterEvent)

  if (!isAdmin || loading) return (
    <Layout session={session} title="Admin">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p style={{ color: '#4a5e42' }}>Loading admin panel…</p>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="Admin Dashboard">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="section-eyebrow">SECURE AREA</div>
            <h1 className="section-title" style={{ fontSize: 28 }}>ADMIN DASHBOARD</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/events" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 11 }}>MANAGE EVENTS</Link>
            <Link href="/admin/players" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 11 }}>PLAYERS</Link>
            <Link href="/admin/ukara" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 11 }}>UKARA</Link>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Revenue this month', value: `£${((stats.monthRevenue || 0) / 100).toFixed(2)}`, delta: stats.revDelta, color: '#6aaa48' },
              { label: 'Bookings this month', value: stats.monthBookings || 0, delta: `+${stats.weekBookings} this week`, color: '#e0e8d8' },
              { label: 'Pending waivers', value: (waiverQueue.new?.length || 0) + (waiverQueue.edits?.length || 0), delta: 'Awaiting review', color: '#c8a030' },
              { label: 'Pending payments', value: stats.pendingPayments || 0, delta: 'Chase required', color: '#c04040' },
            ].map(s => (
              <div key={s.label} className="tac-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, color: '#3a4a34', fontFamily: '"JetBrains Mono", monospace', marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: s.color, letterSpacing: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#5a8c3a', marginTop: 2 }}>{s.delta}</div>
              </div>
            ))}
          </div>
        )}

        {/* Waiver approval queue */}
        {((waiverQueue.new?.length || 0) + (waiverQueue.edits?.length || 0)) > 0 && (
          <div className="tac-card" style={{ marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a' }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2 }}>WAIVER APPROVAL QUEUE</div>
              <span style={{ fontSize: 10, background: 'rgba(200,160,48,0.1)', color: '#c8a030', padding: '2px 8px', borderRadius: 2, border: '0.5px solid rgba(200,160,48,0.3)' }}>
                {(waiverQueue.new?.length || 0) + (waiverQueue.edits?.length || 0)} PENDING
              </span>
            </div>
            {[
              ...(waiverQueue.new || []).map(w => ({ ...w, _type: 'new' })),
              ...(waiverQueue.edits || []).map(w => ({ ...w, _type: 'edit' })),
            ].map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '0.5px solid #0f160e', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 12, color: '#a0b090', fontWeight: 500 }}>{w.profiles?.full_name}</span>
                  <span style={{ fontSize: 10, color: '#4a5e42', marginLeft: 8, fontFamily: '"JetBrains Mono", monospace' }}>
                    {w._type === 'edit' ? 'EDIT TO EXISTING WAIVER' : 'NEW WAIVER'}
                  </span>
                  <span style={{ fontSize: 10, color: '#3a4a34', marginLeft: 8 }}>
                    {w.submitted_at ? format(new Date(w.submitted_at), 'd MMM yyyy HH:mm') : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/admin/waivers/${w.id}?type=${w._type}`} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'rgba(72,136,200,0.1)', color: '#4888c8', border: '0.5px solid rgba(72,136,200,0.25)', textDecoration: 'none' }}>
                    REVIEW
                  </Link>
                  <button onClick={() => handleWaiverAction(w.id, w._type === 'edit', 'approve')} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer' }}>
                    APPROVE
                  </button>
                  <button onClick={() => handleWaiverAction(w.id, w._type === 'edit', 'reject')} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}>
                    REJECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings table */}
        <div className="tac-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>FILTER BY EVENT DATE</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilter('all')}
                style={{ fontSize: 10, padding: '4px 10px', borderRadius: 2, cursor: 'pointer', background: filterEvent === 'all' ? 'rgba(106,170,72,0.1)' : 'transparent', color: filterEvent === 'all' ? '#6aaa48' : '#4a5e42', border: `0.5px solid ${filterEvent === 'all' ? 'rgba(106,170,72,0.3)' : '#1e2a1a'}` }}
              >All events</button>
              {events.map(e => (
                <button
                  key={e.id}
                  onClick={() => setFilter(e.id)}
                  style={{ fontSize: 10, padding: '4px 10px', borderRadius: 2, cursor: 'pointer', background: filterEvent === e.id ? 'rgba(106,170,72,0.1)' : 'transparent', color: filterEvent === e.id ? '#6aaa48' : '#4a5e42', border: `0.5px solid ${filterEvent === e.id ? 'rgba(106,170,72,0.3)' : '#1e2a1a'}` }}
                >
                  {format(new Date(e.event_date), 'd MMM')} — {e.title} ({bookings.filter(b => b.event_id === e.id).length})
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th>PLAYER</th>
                  <th>EVENT</th>
                  <th>PACKAGE</th>
                  <th>PLAYERS</th>
                  <th>PAYMENT</th>
                  <th>REF</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: '#a0b090', fontWeight: 500 }}>
                      {b.profiles?.full_name || 'Unknown'}
                      <div style={{ fontSize: 10, color: '#3a4a34' }}>{b.profiles?.email}</div>
                    </td>
                    <td style={{ fontSize: 11 }}>
                      {b.events?.title}
                      <div style={{ fontSize: 10, color: '#3a4a34' }}>
                        {b.events?.event_date ? format(new Date(b.events.event_date), 'd MMM yyyy') : ''}
                      </div>
                    </td>
                    <td style={{ fontSize: 11 }}>{b.package_type}</td>
                    <td style={{ fontSize: 11, textAlign: 'center' }}>{b.player_count}</td>
                    <td>
                      <span className={`badge ${b.status === 'confirmed' ? 'badge-paid' : b.status === 'cancelled' ? 'badge-sold' : b.status === 'refunded' ? 'badge-ref' : 'badge-pend'}`}>
                        {b.status === 'confirmed' ? `PAID £${((b.amount_paid || 0) / 100).toFixed(2)}` : b.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace' }}>{b.booking_ref}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button onClick={() => handleResendTicket(b.id)} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 2, background: 'rgba(72,136,200,0.1)', color: '#4888c8', border: '0.5px solid rgba(72,136,200,0.25)', cursor: 'pointer', whiteSpace: 'nowrap' }}>✉ TICKET</button>
                        <Link href={`/admin/bookings/${b.id}`} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 2, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.25)', textDecoration: 'none', whiteSpace: 'nowrap' }}>EDIT</Link>
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleRefund(b.id)} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer', whiteSpace: 'nowrap' }}>REFUND</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2e3e28', padding: 24 }}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
