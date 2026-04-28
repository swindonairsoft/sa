// pages/admin/events.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

const BLANK = {
  title: '', description: '', event_date: '', start_time: '09:00', end_time: '17:00',
  location: 'Swindon Airsoft Site, Swindon, Wiltshire', maps_url: '', maps_embed: '',
  event_type: 'outdoor', capacity: 40, price_walkon: 3500, price_hire: 5500, is_active: true,
}

export default function AdminEventsPage({ session }) {
  const router = useRouter()
  const [events,  setEvents]  = useState([])
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(BLANK)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [authState, setAuth]  = useState('checking')

  useEffect(() => {
    if (session === undefined) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok'); loadEvents()
    })
  }, [session])

  const loadEvents = () => apiFetch('/api/admin/events').then(r => r.json()).then(d => setEvents(d.events || []))

  const openNew  = () => { setForm(BLANK); setEditing('new'); setMsg('') }
  const openEdit = (e) => { setForm({ ...e, event_date: e.event_date?.split('T')[0] || '', maps_url: e.maps_url || '', maps_embed: e.maps_embed || '' }); setEditing(e); setMsg('') }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    const isNew = editing === 'new'
    const url = isNew ? '/api/admin/events/create' : `/api/admin/events/${editing.id}/update`
    const res = await apiFetch(url, { method: 'POST', body: JSON.stringify(form) })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg(isNew ? 'Event created.' : 'Event updated.'); setEditing(null); loadEvents() }
    else setMsg(d.error || 'Error saving')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    await apiFetch(`/api/admin/events/${id}/delete`, { method: 'POST' })
    loadEvents()
  }

  const handleToggle = async (id, current) => {
    await apiFetch(`/api/admin/events/${id}/update`, { method: 'POST', body: JSON.stringify({ is_active: !current }) })
    loadEvents()
  }

  // Auto-generate Google Maps embed URL from a share/search URL
  const handleMapsUrl = (url) => {
    setForm(p => ({ ...p, maps_url: url }))
    // Extract coords if possible for embed
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      const embed = `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`
      setForm(p => ({ ...p, maps_url: url, maps_embed: embed }))
    }
  }

  const inputStyle = { width: '100%', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, color: '#e0e8d8', fontSize: 12, padding: '9px 12px' }
  const labelStyle = { display: 'block', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 4 }

  if (authState !== 'ok') return <Layout session={session} title="Events"><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>LOADING…</p></div></Layout>

  return (
    <Layout session={session} title="Manage Events">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/admin" style={{ fontSize: 11, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 6 }}>← Admin dashboard</Link>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2 }}>MANAGE EVENTS</h1>
          </div>
          <button onClick={openNew} style={{ padding: '10px 18px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5 }}>
            + CREATE NEW EVENT
          </button>
        </div>

        {/* Create/Edit form */}
        {editing && (
          <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, color: '#e0e8d8', letterSpacing: 2, marginBottom: 20 }}>
              {editing === 'new' ? 'CREATE NEW EVENT' : `EDITING: ${editing.title}`}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>EVENT TITLE *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} placeholder="e.g. Operation Woodland Storm" />
              </div>
              <div>
                <label style={labelStyle}>EVENT DATE *</label>
                <input type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>EVENT TYPE</label>
                <select value={form.event_type} onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))} style={inputStyle}>
                  <option value="outdoor">Outdoor / Woodland</option>
                  <option value="indoor">Indoor</option>
                  <option value="cqb">CQB</option>
                  <option value="milsim">Mil-Sim</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>START TIME</label>
                <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>END TIME</label>
                <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CAPACITY (PLAYERS)</label>
                <input type="number" min={1} value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WALK-ON PRICE (£)</label>
                <input type="number" step="0.01" value={(form.price_walkon/100).toFixed(2)} onChange={e => setForm(p => ({ ...p, price_walkon: Math.round(parseFloat(e.target.value)*100) }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>HIRE PACKAGE PRICE (£)</label>
                <input type="number" step="0.01" value={(form.price_hire/100).toFixed(2)} onChange={e => setForm(p => ({ ...p, price_hire: Math.round(parseFloat(e.target.value)*100) }))} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>LOCATION / ADDRESS</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} style={inputStyle} placeholder="Full address for players" />
              </div>

              {/* Google Maps */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>GOOGLE MAPS URL (paste from Google Maps share link)</label>
                <input type="text" value={form.maps_url} onChange={e => handleMapsUrl(e.target.value)} style={inputStyle} placeholder="Paste Google Maps URL — e.g. https://maps.google.com/?q=..." />
                <p style={{ fontSize: 10, color: '#3a4a34', marginTop: 4 }}>
                  In Google Maps, search your location → click Share → Copy link → paste above
                </p>
              </div>

              {/* Map preview */}
              {form.maps_embed && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>MAP PREVIEW</label>
                  <div style={{ borderRadius: 4, overflow: 'hidden', border: '0.5px solid #1e2a1a', height: 200 }}>
                    <iframe src={form.maps_embed} width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" title="Event location map" />
                  </div>
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>EVENT DESCRIPTION (OPTIONAL)</label>
                <textarea rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Briefing notes, game modes, special rules…" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: '#6aaa48', width: 16, height: 16 }} />
                <label htmlFor="is_active" style={{ fontSize: 12, color: '#8a9a84', cursor: 'pointer' }}>Active (visible to players)</label>
              </div>
            </div>

            {msg && <p style={{ fontSize: 12, color: msg.includes('Error') || msg.includes('error') ? '#c04040' : '#6aaa48', marginBottom: 12 }}>{msg}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'SAVING…' : editing === 'new' ? 'CREATE EVENT' : 'SAVE CHANGES'}
              </button>
              <button onClick={() => setEditing(null)} style={{ padding: '10px 16px', background: 'transparent', color: '#4a5e42', border: '0.5px solid #1e2a1a', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>CANCEL</button>
            </div>
          </div>
        )}

        {/* Events list */}
        <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['EVENT','DATE','TYPE','CAPACITY','WALK-ON','HIRE','MAP','STATUS','ACTIONS'].map(h => (
                    <th key={h} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#3a4a34', padding: '8px 12px', textAlign: 'left', borderBottom: '0.5px solid #1e2a1a', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} style={{ borderBottom: '0.5px solid rgba(30,42,26,0.4)' }}>
                    <td style={{ padding: '10px 12px', color: '#a0b090', fontWeight: 500, fontSize: 12 }}>{e.title}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#6a7a64', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap' }}>{format(new Date(e.event_date), 'd MMM yyyy')}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 9, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', padding: '2px 6px', borderRadius: 2, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>{e.event_type?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#6a7a64', textAlign: 'center' }}>{e.capacity}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#6aaa48', fontWeight: 600 }}>£{(e.price_walkon/100).toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#6aaa48', fontWeight: 600 }}>£{(e.price_hire/100).toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {e.maps_url ? <span style={{ fontSize: 14 }} title="Map set">📍</span> : <span style={{ fontSize: 11, color: '#2e3e28' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => handleToggle(e.id, e.is_active)} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 2, cursor: 'pointer', background: e.is_active ? 'rgba(106,170,72,0.1)' : 'rgba(192,64,64,0.1)', color: e.is_active ? '#6aaa48' : '#c04040', border: `0.5px solid ${e.is_active ? 'rgba(106,170,72,0.3)' : 'rgba(192,64,64,0.3)'}` }}>
                        {e.is_active ? 'ACTIVE' : 'HIDDEN'}
                      </button>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(e)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.25)', cursor: 'pointer' }}>EDIT</button>
                        <button onClick={() => handleDelete(e.id)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: '#2e3e28', padding: 32, fontSize: 12 }}>No events yet. Create your first event above.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
