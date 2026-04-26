// pages/admin/events.js
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/apiFetch'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'

const BLANK_EVENT = {
  title: '', description: '', event_date: '', start_time: '09:00', end_time: '17:00',
  location: 'Swindon Airsoft Site', event_type: 'outdoor', capacity: 40,
  price_walkon: 3500, price_hire: 5500, is_active: true,
}

export default function AdminEventsPage({ session }) {
  const router = useRouter()
  const [events,  setEvents]  = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | event object
  const [form,    setForm]    = useState(BLANK_EVENT)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setIsAdmin(true)
      loadEvents()
    })
  }, [session])

  const loadEvents = () => {
    apiFetch('/api/admin/events').then(r => r.json()).then(d => setEvents(d.events || []))
  }

  const openNew = () => { setForm(BLANK_EVENT); setEditing('new'); setMsg('') }
  const openEdit = (e) => { setForm({ ...e, price_walkon: e.price_walkon, price_hire: e.price_hire }); setEditing(e); setMsg('') }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    const isNew = editing === 'new'
    const url = isNew ? '/api/admin/events/create' : `/api/admin/events/${editing.id}/update`
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg(isNew ? 'Event created.' : 'Event updated.'); setEditing(null); loadEvents() }
    else setMsg(d.error || 'Error saving')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    await apiFetch(`/api/admin/events/${id}/delete`, { method: 'POST' })
    loadEvents()
  }

  const handleToggle = async (id, current) => {
    await apiFetch(`/api/admin/events/${id}/update`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    loadEvents()
  }

  if (!isAdmin) return <Layout session={session} title="Admin Events"><div className="max-w-4xl mx-auto px-4 py-20 text-center"><p style={{ color: '#4a5e42' }}>Loading…</p></div></Layout>

  return (
    <Layout session={session} title="Manage Events">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/admin" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 8 }}>← Admin dashboard</Link>
            <div className="section-eyebrow">ADMIN</div>
            <h1 className="section-title" style={{ fontSize: 28 }}>MANAGE EVENTS</h1>
          </div>
          <button onClick={openNew} className="btn-primary" style={{ fontSize: 12 }}>+ CREATE NEW EVENT</button>
        </div>

        {/* Create / Edit form */}
        {editing && (
          <div className="tac-card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: '#e0e8d8', letterSpacing: 2, marginBottom: 20 }}>
              {editing === 'new' ? 'CREATE NEW EVENT' : `EDITING: ${editing.title}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="field-label">EVENT TITLE</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="field-input" placeholder="e.g. Operation Woodland Storm" />
              </div>
              <div>
                <label className="field-label">EVENT DATE</label>
                <input type="date" value={form.event_date ? form.event_date.split('T')[0] : ''} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} className="field-input" />
              </div>
              <div>
                <label className="field-label">EVENT TYPE</label>
                <select value={form.event_type} onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))} className="field-input">
                  <option value="outdoor">Outdoor / Woodland</option>
                  <option value="indoor">Indoor</option>
                  <option value="cqb">CQB</option>
                  <option value="milsim">Mil-Sim</option>
                </select>
              </div>
              <div>
                <label className="field-label">START TIME</label>
                <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className="field-input" />
              </div>
              <div>
                <label className="field-label">END TIME</label>
                <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className="field-input" />
              </div>
              <div>
                <label className="field-label">LOCATION</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="field-input" />
              </div>
              <div>
                <label className="field-label">CAPACITY (PLAYERS)</label>
                <input type="number" min={1} max={500} value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} className="field-input" />
              </div>
              <div>
                <label className="field-label">WALK-ON PRICE (£)</label>
                <input type="number" step="0.01" min={0} value={(form.price_walkon / 100).toFixed(2)} onChange={e => setForm(p => ({ ...p, price_walkon: Math.round(parseFloat(e.target.value) * 100) }))} className="field-input" />
              </div>
              <div>
                <label className="field-label">HIRE PACKAGE PRICE (£)</label>
                <input type="number" step="0.01" min={0} value={(form.price_hire / 100).toFixed(2)} onChange={e => setForm(p => ({ ...p, price_hire: Math.round(parseFloat(e.target.value) * 100) }))} className="field-input" />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">EVENT DESCRIPTION (OPTIONAL)</label>
                <textarea rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="field-input" style={{ resize: 'vertical' }} placeholder="Briefing notes, game modes, special rules…" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: '#6aaa48', width: 16, height: 16 }} />
                <label htmlFor="is_active" style={{ fontSize: 12, color: '#8a9a84' }}>Active (visible to players)</label>
              </div>
            </div>

            {msg && <p style={{ fontSize: 12, color: msg.includes('Error') ? '#c04040' : '#6aaa48', marginBottom: 12 }}>{msg}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: 12 }}>{saving ? 'SAVING…' : editing === 'new' ? 'CREATE EVENT' : 'SAVE CHANGES'}</button>
              <button onClick={() => setEditing(null)} className="btn-secondary" style={{ fontSize: 12 }}>CANCEL</button>
            </div>
          </div>
        )}

        {/* Events list */}
        <div className="tac-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>EVENT</th><th>DATE</th><th>TYPE</th><th>CAPACITY</th><th>WALK-ON</th><th>HIRE</th><th>STATUS</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td style={{ color: '#a0b090', fontWeight: 500 }}>{e.title}</td>
                    <td style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace' }}>{format(new Date(e.event_date), 'd MMM yyyy')}</td>
                    <td><span style={{ fontSize: 9, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', padding: '2px 6px', borderRadius: 2, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>{e.event_type?.toUpperCase()}</span></td>
                    <td style={{ fontSize: 11 }}>{e.capacity}</td>
                    <td style={{ color: '#6aaa48', fontSize: 12 }}>£{(e.price_walkon / 100).toFixed(2)}</td>
                    <td style={{ color: '#6aaa48', fontSize: 12 }}>£{(e.price_hire / 100).toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleToggle(e.id, e.is_active)} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 2, cursor: 'pointer', background: e.is_active ? 'rgba(106,170,72,0.1)' : 'rgba(192,64,64,0.1)', color: e.is_active ? '#6aaa48' : '#c04040', border: `0.5px solid ${e.is_active ? 'rgba(106,170,72,0.3)' : 'rgba(192,64,64,0.3)'}` }}>
                        {e.is_active ? 'ACTIVE' : 'HIDDEN'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(e)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.25)', cursor: 'pointer' }}>EDIT</button>
                        <button onClick={() => handleDelete(e.id)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#2e3e28', padding: 24 }}>No events yet. Create your first event above.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
