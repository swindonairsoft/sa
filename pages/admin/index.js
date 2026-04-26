// pages/admin/index.js
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/apiFetch'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

export default function AdminDashboard({ session }) {
  const router = useRouter()
  const [stats,      setStats]    = useState(null)
  const [bookings,   setBookings] = useState([])
  const [events,     setEvents]   = useState([])
  const [filterEvent,setFilter]   = useState('all')
  const [waiverQueue,setWaiverQ]  = useState({ new: [], edits: [] })
  const [loading,    setLoading]  = useState(true)
  const [authState,  setAuthState]= useState('checking') // 'checking' | 'admin' | 'denied'
  const [msg,        setMsg]      = useState('')

  useEffect(() => {
    // Wait until session is resolved (not just null on first render)
    if (session === undefined) return
    if (session === null) {
      // Give it a moment in case _app is still loading
      const t = setTimeout(() => router.push('/auth/login?redirect=/admin'), 800)
      return () => clearTimeout(t)
    }
    apiFetch('/api/admin/verify')
      .then(r => r.json())
      .then(d => {
        if (d.isAdmin) {
          setAuthState('admin')
          loadAll()
        } else {
          setAuthState('denied')
          setTimeout(() => router.push('/'), 2000)
        }
      })
      .catch(() => setAuthState('denied'))
  }, [session])

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      apiFetch('/api/admin/stats').then(r => r.json()).catch(() => ({})),
      apiFetch('/api/admin/bookings').then(r => r.json()).catch(() => ({ bookings: [] })),
      apiFetch('/api/admin/events').then(r => r.json()).catch(() => ({ events: [] })),
      apiFetch('/api/admin/waivers/pending').then(r => r.json()).catch(() => ({ new: [], edits: [] })),
    ]).then(([s, b, e, w]) => {
      setStats(s)
      setBookings(b.bookings || [])
      setEvents(e.events || [])
      setWaiverQ(w)
      setLoading(false)
    })
  }

  const handleWaiverAction = async (id, isEdit, action) => {
    await apiFetch(`/api/admin/waivers/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isEdit }),
    })
    loadAll()
  }

  const handleResendTicket = async (bookingId) => {
    await apiFetch(`/api/admin/bookings/${bookingId}/resend-ticket`, { method: 'POST' })
    setMsg('Ticket resent.')
  }

  const handleRefund = async (bookingId) => {
    if (!confirm('Process full refund for this booking?')) return
    const reason = prompt('Reason for refund (optional):') || ''
    await apiFetch(`/api/admin/bookings/${bookingId}/refund`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    loadAll()
    setMsg('Refund processed.')
  }

  const filteredBookings = filterEvent === 'all'
    ? bookings
    : bookings.filter(b => b.event_id === filterEvent)

  // Loading / auth states
  if (authState === 'checking') return (
    <Layout session={session} title="Admin">
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#4a5e42', letterSpacing: 2 }}>VERIFYING ACCESS…</div>
        </div>
      </div>
    </Layout>
  )

  if (authState === 'denied') return (
    <Layout session={session} title="Access Denied">
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#c04040', letterSpacing: 2, marginBottom: 8 }}>ACCESS DENIED</div>
          <p style={{ color: '#4a5e42', fontSize: 13 }}>You do not have admin access.</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="Admin Dashboard">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>SECURE AREA</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2 }}>ADMIN DASHBOARD</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/admin/events" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 4, background: 'transparent', color: '#8aaa68', border: '0.5px solid rgba(106,170,72,0.35)', textDecoration: 'none' }}>MANAGE EVENTS</Link>
            <Link href="/admin/players" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 4, background: 'transparent', color: '#8aaa68', border: '0.5px solid rgba(106,170,72,0.35)', textDecoration: 'none' }}>PLAYERS</Link>
            <Link href="/admin/ukara" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 4, background: 'transparent', color: '#8aaa68', border: '0.5px solid rgba(106,170,72,0.35)', textDecoration: 'none' }}>UKARA</Link>
          </div>
        </div>

        {msg && <div style={{ fontSize: 12, color: '#6aaa48', marginBottom: 16, padding: '8px 12px', background: 'rgba(106,170,72,0.08)', border: '0.5px solid rgba(106,170,72,0.2)', borderRadius: 4 }}>{msg}</div>}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Revenue this month', value: `£${((stats.monthRevenue || 0) / 100).toFixed(2)}`, color: '#6aaa48' },
              { label: 'Bookings this month', value: stats.monthBookings || 0, color: '#e0e8d8' },
              { label: 'Pending waivers', value: (waiverQueue.new?.length || 0) + (waiverQueue.edits?.length || 0), color: '#c8a030' },
              { label: 'Pending payments', value: stats.pendingPayments || 0, color: '#c04040' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 16 }}>
                <div style={{ fontSize: 10, color: '#3a4a34', fontFamily: '"JetBrains Mono", monospace', marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: s.color, letterSpacing: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Waiver queue */}
        {((waiverQueue.new?.length || 0) + (waiverQueue.edits?.length || 0)) > 0 && (
          <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a' }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2 }}>WAIVER APPROVAL QUEUE</div>
              <span style={{ fontSize: 10, background: 'rgba(200,160,48,0.1)', color: '#c8a030', padding: '2px 8px', borderRadius: 2, border: '0.5px solid rgba(200,160,48,0.3)' }}>
                {(waiverQueue.new?.length || 0) + (waiverQueue.edits?.length || 0)} PENDING
              </span>
            </div>
            {[...(waiverQueue.new||[]).map(w=>({...w,_type:'new'})), ...(waiverQueue.edits||[]).map(w=>({...w,_type:'edit'}))].map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '0.5px solid #0f160e', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 12, color: '#a0b090', fontWeight: 500 }}>{w.profiles?.full_name}</span>
                  <span style={{ fontSize: 10, color: '#4a5e42', marginLeft: 8, fontFamily: '"JetBrains Mono", monospace' }}>
                    {w._type === 'edit' ? 'EDIT' : 'NEW WAIVER'}
                  </span>
                  <span style={{ fontSize: 10, color: '#3a4a34', marginLeft: 8 }}>
                    {w.submitted_at ? format(new Date(w.submitted_at), 'd MMM yyyy HH:mm') : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleWaiverAction(w.id, w._type==='edit', 'approve')} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer' }}>APPROVE</button>
                  <button onClick={() => handleWaiverAction(w.id, w._type==='edit', 'reject')}  style={{ fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'rgba(192,64,64,0.1)',  color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)',  cursor: 'pointer' }}>REJECT</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings table */}
        <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #1e2a1a' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>FILTER BY EVENT DATE</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[{ id: 'all', label: 'All events' }, ...events.map(e => ({ id: e.id, label: `${format(new Date(e.event_date), 'd MMM')} — ${e.title}` }))].map(opt => (
                <button key={opt.id} onClick={() => setFilter(opt.id)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 2, cursor: 'pointer', background: filterEvent === opt.id ? 'rgba(106,170,72,0.1)' : 'transparent', color: filterEvent === opt.id ? '#6aaa48' : '#4a5e42', border: `0.5px solid ${filterEvent === opt.id ? 'rgba(106,170,72,0.3)' : '#1e2a1a'}` }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['PLAYER','EVENT','PACKAGE','PLAYERS','PAYMENT','REF','ACTIONS'].map(h => (
                    <th key={h} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', padding: '8px 12px', textAlign: 'left', borderBottom: '0.5px solid #1e2a1a', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '0.5px solid rgba(30,42,26,0.5)' }}>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ color: '#a0b090', fontWeight: 500, fontSize: 12 }}>{b.profiles?.full_name}</div>
                      <div style={{ fontSize: 10, color: '#3a4a34' }}>{b.profiles?.email}</div>
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 11, color: '#6a7a64' }}>
                      {b.events?.title}
                      <div style={{ fontSize: 10, color: '#3a4a34' }}>{b.events?.event_date ? format(new Date(b.events.event_date), 'd MMM yyyy') : ''}</div>
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 11, color: '#6a7a64' }}>{b.package_type}</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, color: '#6a7a64', textAlign: 'center' }}>{b.player_count}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 2, fontWeight: 500, background: b.status==='confirmed'?'rgba(106,170,72,0.15)':b.status==='refunded'?'rgba(72,136,200,0.15)':'rgba(200,160,48,0.15)', color: b.status==='confirmed'?'#6aaa48':b.status==='refunded'?'#4888c8':'#c8a030', border: `0.5px solid ${b.status==='confirmed'?'rgba(106,170,72,0.3)':b.status==='refunded'?'rgba(72,136,200,0.3)':'rgba(200,160,48,0.3)'}` }}>
                        {b.status==='confirmed'?`PAID £${((b.amount_paid||0)/100).toFixed(2)}`:b.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace' }}>{b.booking_ref}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button onClick={() => handleResendTicket(b.id)} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 2, background: 'rgba(72,136,200,0.1)', color: '#4888c8', border: '0.5px solid rgba(72,136,200,0.25)', cursor: 'pointer' }}>✉ TICKET</button>
                        <Link href={`/admin/bookings/${b.id}`} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 2, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.25)', textDecoration: 'none' }}>EDIT</Link>
                        {b.status==='confirmed' && <button onClick={() => handleRefund(b.id)} style={{ fontSize: 9, padding: '3px 7px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}>REFUND</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2e3e28', padding: 32, fontSize: 12 }}>No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
