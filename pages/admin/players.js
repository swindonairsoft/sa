// pages/admin/players.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

export default function AdminPlayersPage({ session }) {
  const router = useRouter()
  const [players,  setPlayers]  = useState([])
  const [events,   setEvents]   = useState([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [waiver,   setWaiver]   = useState(null)
  const [editForm, setEditForm] = useState({})
  const [gameDayForm, setGDForm]= useState({ eventId: '', date: new Date().toISOString().split('T')[0] })
  const [tab,      setTab]      = useState('details') // details | waiver | gamedays | additional
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')
  const [authState,setAuth]     = useState('checking')

  useEffect(() => {
    if (session === undefined) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok'); loadData()
    })
  }, [session])

  const loadData = () => {
    Promise.all([
      apiFetch('/api/admin/players').then(r => r.json()),
      apiFetch('/api/admin/events').then(r => r.json()),
    ]).then(([p, e]) => {
      setPlayers(p.players || [])
      setEvents(e.events || [])
    })
  }

  const selectPlayer = async (p) => {
    setSelected(p)
    setEditForm({
      full_name: p.full_name || '', email: p.email || '', phone: p.phone || '',
      date_of_birth: p.date_of_birth || '', address_line1: p.address_line1 || '',
      address_line2: p.address_line2 || '', city: p.city || '', postcode: p.postcode || '',
      ukara_number: p.ukara_number || '', ukara_expires_at: p.ukara_expires_at ? p.ukara_expires_at.split('T')[0] : '',
    })
    setMsg(''); setTab('details')
    // Load their waiver
    const wr = await apiFetch(`/api/admin/players/${p.id}/waiver`).then(r => r.json()).catch(() => ({}))
    setWaiver(wr.waiver || null)
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    const res = await apiFetch(`/api/admin/players/${selected.id}/update`, {
      method: 'POST', body: JSON.stringify(editForm),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg('Player updated.'); loadData() }
    else setMsg(d.error || 'Error saving')
  }

  const handleLogGameDay = async () => {
    setSaving(true)
    const res = await apiFetch('/api/admin/players/log-gameday', {
      method: 'POST', body: JSON.stringify({ userId: selected.id, ...gameDayForm }),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg('Game day logged.'); loadData() }
    else setMsg(d.error || 'Error')
  }

  const filtered = players.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const fieldStyle = { marginBottom: 12 }
  const labelStyle = { display: 'block', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 4 }
  const inputStyle = { width: '100%', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, color: '#e0e8d8', fontSize: 12, padding: '8px 10px' }

  if (authState !== 'ok') return (
    <AdminLayout session={session} title="Players"><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>LOADING…</p></div></AdminLayout>
  )

  return (
    <AdminLayout session={session} title="Players">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2 }}>PLAYERS</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 16, alignItems: 'start' }}>
          {/* Players list */}
          <div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ ...inputStyle, marginBottom: 12, maxWidth: 380 }}
            />
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr>
                      {['PLAYER','WAIVER','GAME DAYS','UKARA',''].map(h => (
                        <th key={h} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', padding: '8px 12px', textAlign: 'left', borderBottom: '0.5px solid #1e2a1a', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const ws = p.waivers?.[0]?.status
                      const isSelected = selected?.id === p.id
                      return (
                        <tr key={p.id}
                          onClick={() => selectPlayer(p)}
                          style={{ borderBottom: '0.5px solid rgba(30,42,26,0.4)', cursor: 'pointer', background: isSelected ? 'rgba(106,170,72,0.05)' : 'transparent' }}
                        >
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ color: '#c0d0b8', fontWeight: 500, fontSize: 12 }}>{p.full_name || '—'}</div>
                            <div style={{ fontSize: 10, color: '#3a4a34' }}>{p.email}</div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 2,
                              background: ws==='approved' ? 'rgba(106,170,72,0.12)' : ws==='pending_approval' ? 'rgba(200,160,48,0.12)' : 'rgba(100,100,100,0.12)',
                              color:      ws==='approved' ? '#6aaa48'               : ws==='pending_approval' ? '#c8a030'               : '#5a5a5a',
                              border:     `0.5px solid ${ws==='approved' ? 'rgba(106,170,72,0.3)' : ws==='pending_approval' ? 'rgba(200,160,48,0.3)' : 'rgba(100,100,100,0.2)'}`,
                            }}>
                              {ws?.toUpperCase().replace(/_/g,' ') || 'NONE'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: (p.game_day_count||0) >= 3 ? '#6aaa48' : '#c8a030' }}>
                            {p.game_day_count || 0}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 10, color: p.ukara_number ? '#6aaa48' : '#3a4a34', fontFamily: '"JetBrains Mono", monospace' }}>
                            {p.ukara_number || '—'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <button onClick={e => { e.stopPropagation(); selectPlayer(p) }} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer' }}>EDIT</button>
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#2e3e28', padding: 28, fontSize: 12 }}>No players found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Player edit panel */}
          {selected && (
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
              {/* Panel header */}
              <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #1e2a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#c0d0b8' }}>{selected.full_name}</div>
                  <div style={{ fontSize: 10, color: '#3a4a34' }}>{selected.email}</div>
                </div>
                <button onClick={() => { setSelected(null); setWaiver(null) }} style={{ background: 'none', border: 'none', color: '#4a5e42', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '0.5px solid #1e2a1a' }}>
                {['details', 'waiver', 'gamedays', 'additional'].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px 4px', fontSize: 9, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1, background: tab === t ? 'rgba(106,170,72,0.08)' : 'transparent', color: tab === t ? '#6aaa48' : '#3a4a34', border: 'none', borderBottom: tab === t ? '1.5px solid #6aaa48' : '1.5px solid transparent', cursor: 'pointer' }}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ padding: 16 }}>
                {msg && <div style={{ fontSize: 11, color: msg.includes('Error') || msg.includes('error') ? '#c04040' : '#6aaa48', marginBottom: 12, padding: '6px 10px', background: 'rgba(106,170,72,0.06)', borderRadius: 3 }}>{msg}</div>}

                {/* DETAILS TAB */}
                {tab === 'details' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { key: 'full_name',     label: 'Full Name',     type: 'text'  },
                        { key: 'email',         label: 'Email',         type: 'email' },
                        { key: 'phone',         label: 'Phone',         type: 'tel'   },
                        { key: 'date_of_birth', label: 'Date of Birth', type: 'date'  },
                        { key: 'address_line1', label: 'Address Line 1',type: 'text'  },
                        { key: 'address_line2', label: 'Address Line 2',type: 'text'  },
                        { key: 'city',          label: 'City',          type: 'text'  },
                        { key: 'postcode',      label: 'Postcode',      type: 'text'  },
                      ].map(f => (
                        <div key={f.key} style={fieldStyle}>
                          <label style={labelStyle}>{f.label.toUpperCase()}</label>
                          <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                        </div>
                      ))}
                    </div>

                    {/* UKARA section */}
                    <div style={{ marginTop: 12, padding: 12, background: '#080c07', borderRadius: 4, border: '0.5px solid #1e2a1a' }}>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#6aaa48', letterSpacing: 2, marginBottom: 10 }}>UKARA DETAILS (ADMIN ASSIGN)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>UKARA NUMBER</label>
                          <input type="text" value={editForm.ukara_number || ''} onChange={e => setEditForm(p => ({ ...p, ukara_number: e.target.value }))} style={inputStyle} placeholder="e.g. SA-2025-0001" />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>UKARA EXPIRY DATE</label>
                          <input type="date" value={editForm.ukara_expires_at || ''} onChange={e => setEditForm(p => ({ ...p, ukara_expires_at: e.target.value }))} style={inputStyle} />
                        </div>
                      </div>
                    </div>

                    <button onClick={handleSave} disabled={saving} style={{ width: '100%', marginTop: 14, padding: '10px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5 }}>
                      {saving ? 'SAVING…' : 'SAVE CHANGES'}
                    </button>
                  </div>
                )}

                {/* WAIVER TAB */}
                {tab === 'waiver' && (
                  <div>
                    {waiver ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ fontSize: 11, color: '#6a7a64' }}>Status</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: waiver.status === 'approved' ? '#6aaa48' : '#c8a030' }}>{waiver.status?.toUpperCase().replace(/_/g,' ')}</span>
                        </div>
                        {waiver.signed_at && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: '#6a7a64' }}>Signed</span>
                            <span style={{ fontSize: 11, color: '#c0d0b8' }}>{format(new Date(waiver.signed_at), 'd MMM yyyy HH:mm')}</span>
                          </div>
                        )}
                        {waiver.esign_name && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: '#6a7a64' }}>E-Signature</span>
                            <span style={{ fontSize: 11, color: '#c0d0b8', fontStyle: 'italic' }}>{waiver.esign_name}</span>
                          </div>
                        )}
                        {waiver.is_under18 && waiver.parent_data && (
                          <div style={{ background: 'rgba(200,160,48,0.06)', border: '0.5px solid rgba(200,160,48,0.2)', borderRadius: 4, padding: 10, marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: '#c8a030', fontFamily: '"JetBrains Mono", monospace', marginBottom: 6 }}>U18 — PARENT/GUARDIAN</div>
                            <div style={{ fontSize: 11, color: '#a08030' }}>{waiver.parent_data.parentName} · {waiver.parent_data.parentEmail}</div>
                          </div>
                        )}
                        {waiver.text_values?.medical && (
                          <div style={{ background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, padding: 10, marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', marginBottom: 4 }}>MEDICAL DISCLOSURE</div>
                            <div style={{ fontSize: 12, color: '#8a9a84', lineHeight: 1.6 }}>{waiver.text_values.medical}</div>
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 10, color: '#3a4a34', fontFamily: '"JetBrains Mono", monospace', marginBottom: 8 }}>SECTIONS AGREED</div>
                          {Object.entries(waiver.sections_agreed || {}).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '0.5px solid #1a2218', fontSize: 11, color: val ? '#6aaa48' : '#3a4a34' }}>
                              <span>{val ? '✓' : '✗'}</span>
                              <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p style={{ fontSize: 12, color: '#3a4a34', textAlign: 'center', padding: '20px 0' }}>No waiver submitted yet.</p>
                    )}
                  </div>
                )}

                {/* GAME DAYS TAB */}
                {tab === 'gamedays' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 40, color: (selected.game_day_count||0) >= 3 ? '#6aaa48' : '#c8a030', lineHeight: 1 }}>{selected.game_day_count || 0}</div>
                        <div style={{ fontSize: 10, color: '#3a4a34' }}>game days in last 12 months</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 11, color: (selected.game_day_count||0) >= 3 ? '#6aaa48' : '#c8a030' }}>
                        {(selected.game_day_count||0) >= 3 ? '✓ UKARA eligible' : `${3-(selected.game_day_count||0)} more needed`}
                      </div>
                    </div>

                    <div style={{ background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, padding: 12, marginBottom: 14 }}>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 10 }}>LOG ATTENDANCE</div>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>EVENT (OPTIONAL)</label>
                        <select value={gameDayForm.eventId} onChange={e => setGDForm(p => ({ ...p, eventId: e.target.value }))} style={inputStyle}>
                          <option value="">Manual entry</option>
                          {events.map(e => <option key={e.id} value={e.id}>{format(new Date(e.event_date), 'd MMM yyyy')} — {e.title}</option>)}
                        </select>
                      </div>
                      <div style={fieldStyle}>
                        <label style={labelStyle}>DATE ATTENDED</label>
                        <input type="date" value={gameDayForm.date} onChange={e => setGDForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                      </div>
                      <button onClick={handleLogGameDay} disabled={saving} style={{ width: '100%', padding: '9px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        {saving ? 'LOGGING…' : 'LOG GAME DAY'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ADDITIONAL WAIVERS TAB */}
                {tab === 'additional' && (
                  <AdditionalWaivers playerId={selected.id} playerName={selected.full_name} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

// Additional waivers component (for extra players the main player is bringing)
function AdditionalWaivers({ playerId, playerName }) {
  const [waivers,  setWaivers]  = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ full_name: '', date_of_birth: '', relationship: 'guest' })
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')

  useEffect(() => {
    apiFetch(`/api/admin/players/${playerId}/additional-waivers`).then(r => r.json()).then(d => setWaivers(d.waivers || []))
  }, [playerId])

  const handleAdd = async () => {
    if (!form.full_name || !form.date_of_birth) return setMsg('Name and DOB required.')
    setSaving(true)
    const res = await apiFetch(`/api/admin/players/${playerId}/additional-waivers`, {
      method: 'POST', body: JSON.stringify(form),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) {
      setMsg('Waiver added.'); setShowForm(false)
      setForm({ full_name: '', date_of_birth: '', relationship: 'guest' })
      apiFetch(`/api/admin/players/${playerId}/additional-waivers`).then(r => r.json()).then(d => setWaivers(d.waivers || []))
    } else setMsg(d.error || 'Error')
  }

  const labelStyle = { display: 'block', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 4 }
  const inputStyle = { width: '100%', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, color: '#e0e8d8', fontSize: 12, padding: '8px 10px' }

  return (
    <div>
      <p style={{ fontSize: 12, color: '#4a5e42', marginBottom: 12, lineHeight: 1.6 }}>
        Additional waivers for extra players (e.g. family members, guests) associated with {playerName}'s account.
      </p>
      {msg && <div style={{ fontSize: 11, color: '#6aaa48', marginBottom: 10, padding: '6px 10px', background: 'rgba(106,170,72,0.06)', borderRadius: 3 }}>{msg}</div>}

      {waivers.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {waivers.map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid #1a2218', fontSize: 12 }}>
              <div>
                <div style={{ color: '#c0d0b8', fontWeight: 500 }}>{w.full_name}</div>
                <div style={{ fontSize: 10, color: '#3a4a34' }}>DOB: {w.date_of_birth ? format(new Date(w.date_of_birth), 'd MMM yyyy') : '—'} · {w.relationship}</div>
              </div>
              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 2, background: 'rgba(106,170,72,0.12)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.3)' }}>WAIVER ON FILE</span>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '9px', background: 'transparent', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.35)', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          + ADD ADDITIONAL WAIVER
        </button>
      ) : (
        <div style={{ background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, padding: 12 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 10 }}>NEW ADDITIONAL WAIVER</div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>FULL NAME *</label>
            <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} style={inputStyle} placeholder="Player's full name" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>DATE OF BIRTH *</label>
            <input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>RELATIONSHIP</label>
            <select value={form.relationship} onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))} style={inputStyle}>
              <option value="guest">Guest</option>
              <option value="family">Family member</option>
              <option value="friend">Friend</option>
              <option value="child">Child (U18)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} disabled={saving} style={{ flex: 1, padding: '9px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'SAVING…' : 'ADD WAIVER'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#4a5e42', border: '0.5px solid #1e2a1a', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  )
}
