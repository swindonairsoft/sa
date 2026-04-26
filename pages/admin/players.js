// pages/admin/players.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AdminPlayersPage({ session }) {
  const router = useRouter()
  const [players,  setPlayers]  = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [isAdmin,  setIsAdmin]  = useState(false)
  const [selected, setSelected] = useState(null)
  const [gameDayForm, setGameDayForm] = useState({ eventId: '', date: '' })
  const [events, setEvents] = useState([])
  const [logMsg, setLogMsg] = useState('')

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    fetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setIsAdmin(true)
      loadData()
    })
  }, [session])

  const loadData = () => {
    Promise.all([
      fetch('/api/admin/players').then(r => r.json()),
      fetch('/api/admin/events').then(r => r.json()),
    ]).then(([p, e]) => {
      setPlayers(p.players || [])
      setEvents(e.events || [])
      setLoading(false)
    })
  }

  const handleLogGameDay = async (userId) => {
    setLogMsg('')
    const res = await fetch('/api/admin/players/log-gameday', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, eventId: gameDayForm.eventId || null, date: gameDayForm.date }),
    })
    const d = await res.json()
    if (res.ok) { setLogMsg('Game day logged.'); loadData() }
    else setLogMsg(d.error || 'Error')
  }

  const filtered = players.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isAdmin || loading) return <Layout session={session} title="Players"><div className="max-w-4xl mx-auto px-4 py-20 text-center"><p style={{ color: '#4a5e42' }}>Loading…</p></div></Layout>

  return (
    <Layout session={session} title="Players">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/admin" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 8 }}>← Admin dashboard</Link>
            <div className="section-eyebrow">ADMIN</div>
            <h1 className="section-title" style={{ fontSize: 28 }}>PLAYERS</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/profile-edits" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 11 }}>PROFILE EDIT APPROVALS</Link>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="field-input" placeholder="Search by name or email…" style={{ maxWidth: 360 }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players table */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="tac-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr><th>PLAYER</th><th>WAIVER</th><th>GAME DAYS</th><th>UKARA</th><th>ACTIONS</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}>
                        <td>
                          <div style={{ color: '#a0b090', fontWeight: 500, fontSize: 12 }}>{p.full_name || 'No name'}</div>
                          <div style={{ fontSize: 10, color: '#4a5e42' }}>{p.email}</div>
                        </td>
                        <td>
                          <span className={`badge ${p.waivers?.[0]?.status === 'approved' ? 'badge-paid' : p.waivers?.[0]?.status === 'pending_approval' ? 'badge-pend' : 'badge-sold'}`} style={{ fontSize: 9 }}>
                            {p.waivers?.[0]?.status?.toUpperCase().replace(/_/g,' ') || 'NONE'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: (p.game_day_count || 0) >= 3 ? '#6aaa48' : '#c8a030', textAlign: 'center', fontWeight: 600 }}>
                          {p.game_day_count || 0}
                        </td>
                        <td style={{ fontSize: 11 }}>
                          {p.ukara_number
                            ? <span style={{ color: '#6aaa48', fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }}>{p.ukara_number}</span>
                            : <span style={{ color: '#3a4a34', fontSize: 10 }}>—</span>
                          }
                        </td>
                        <td>
                          <button onClick={(e) => { e.stopPropagation(); setSelected(p); setGameDayForm({ eventId: '', date: new Date().toISOString().split('T')[0] }) }} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer' }}>
                            LOG GAME DAY
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#2e3e28', padding: 24 }}>No players found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Player detail / log game day */}
          <div>
            {selected ? (
              <div className="tac-card" style={{ padding: 18 }}>
                <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>PLAYER DETAILS</h3>
                {[
                  ['Name', selected.full_name],
                  ['Email', selected.email],
                  ['Phone', selected.phone || '—'],
                  ['DOB', selected.date_of_birth ? format(new Date(selected.date_of_birth), 'd MMM yyyy') : '—'],
                  ['Address', [selected.address_line1, selected.city, selected.postcode].filter(Boolean).join(', ') || '—'],
                  ['UKARA', selected.ukara_number || '—'],
                  ['Game days (12mo)', selected.game_day_count || 0],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #1e2a1a', fontSize: 12 }}>
                    <span style={{ color: '#4a5e42', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}>{label.toUpperCase()}</span>
                    <span style={{ color: '#c0d0b8' }}>{value}</span>
                  </div>
                ))}

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>LOG GAME DAY ATTENDANCE</div>
                  <div style={{ marginBottom: 8 }}>
                    <label className="field-label">EVENT (OPTIONAL)</label>
                    <select value={gameDayForm.eventId} onChange={e => setGameDayForm(p => ({ ...p, eventId: e.target.value }))} className="field-input">
                      <option value="">Manual entry</option>
                      {events.map(e => <option key={e.id} value={e.id}>{format(new Date(e.event_date), 'd MMM yyyy')} — {e.title}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="field-label">DATE ATTENDED</label>
                    <input type="date" value={gameDayForm.date} onChange={e => setGameDayForm(p => ({ ...p, date: e.target.value }))} className="field-input" />
                  </div>
                  {logMsg && <p style={{ fontSize: 11, color: logMsg.includes('Error') ? '#c04040' : '#6aaa48', marginBottom: 8 }}>{logMsg}</p>}
                  <button onClick={() => handleLogGameDay(selected.id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}>LOG ATTENDANCE</button>
                </div>
              </div>
            ) : (
              <div className="tac-card" style={{ padding: 18, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#3a4a34' }}>Select a player to view details and log game day attendance.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
