// pages/admin/events.js
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

const BLANK = {
  title: '', description: '', event_date: '', start_time: '09:00', end_time: '17:00',
  location: 'Swindon Airsoft Site, Swindon, Wiltshire', maps_url: '', maps_embed: '',
  event_type: 'outdoor', capacity: 40, price_walkon: 3500, price_hire: 5500, is_active: true,
  walkon_includes: 'Full day game access\nSafety brief included\nChrono check on arrival\nParking included',
  hire_includes: 'RIF (replica firearm) included\nUnlimited BBs all day\nFull face protection\nCombat fatigues\nEverything in Walk-on',
  addons_config: JSON.stringify([
    { id: 'pyro', label: 'Pyro Pack', price: 1000, note: '18+ only — UK firework regulations apply' },
    { id: 'ammo', label: 'Extra Ammo Bag', price: 500, note: 'Walk-on players only' },
  ]),
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
  const openEdit = (e) => { setForm({ ...e, event_date: e.event_date?.split('T')[0] || '', maps_url: e.maps_url || '', maps_embed: e.maps_embed || '', walkon_includes: e.walkon_includes || '', hire_includes: e.hire_includes || '', addons_config: e.addons_config || '' }); setEditing(e); setMsg('') }

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
    if (!url) { setForm(p => ({ ...p, maps_url: '', maps_embed: '' })); return }

    let embed = null

    // Try @lat,lng format (e.g. google.com/maps/@51.5,-1.7,15z)
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      embed = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${coordMatch[2]}!3d${coordMatch[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2suk!4v1`
    }

    // Try ?q= query format
    const qMatch = url.match(/[?&]q=([^&]+)/)
    if (!embed && qMatch) {
      embed = `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(qMatch[1]))}&output=embed`
    }

    // Try place format (maps.google.com/maps/place/...)
    const placeMatch = url.match(/place\/([^/@]+)/)
    if (!embed && placeMatch) {
      embed = `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g,' ')))}&output=embed`
    }

    // Fallback: if it's already an embed URL
    if (!embed && url.includes('embed')) embed = url

    setForm(p => ({ ...p, maps_url: url, maps_embed: embed || '' }))
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

              {/* Package includes */}
              <div>
                <label style={labelStyle}>WALK-ON PACKAGE INCLUDES (one item per line)</label>
                <textarea rows={4} value={form.walkon_includes || ''} onChange={e => setForm(p => ({ ...p, walkon_includes: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Full day game access\nSafety brief\nParking included'} />
              </div>
              <div>
                <label style={labelStyle}>HIRE PACKAGE INCLUDES (one item per line)</label>
                <textarea rows={4} value={form.hire_includes || ''} onChange={e => setForm(p => ({ ...p, hire_includes: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'RIF + unlimited BBs\nFull face protection\nCombat fatigues'} />
              </div>

              {/* Add-ons editor */}
              <div style={{ gridColumn: '1 / -1' }}>
                <AddonsEditor value={form.addons_config} onChange={v => setForm(p => ({ ...p, addons_config: v }))} />
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


// ── Addons Editor ─────────────────────────────────────────────
function AddonsEditor({ value, onChange }) {
  const parseAddons = (v) => {
    if (!v) return [
      { id: 'pyro', label: 'Pyro Pack',      price: 1000, note: '18+ only — UK firework regulations apply' },
      { id: 'ammo', label: 'Extra Ammo Bag', price: 500,  note: 'Walk-on players only' },
    ]
    try { return JSON.parse(v) } catch { return [] }
  }

  const [addons, setAddons] = React.useState(() => parseAddons(value))

  const update = (newAddons) => {
    setAddons(newAddons)
    onChange(JSON.stringify(newAddons))
  }

  const updateAddon = (idx, field, val) => {
    const next = addons.map((a, i) =>
      i === idx ? { ...a, [field]: field === 'price' ? Math.round(parseFloat(val || 0) * 100) : val } : a
    )
    update(next)
  }

  const addNew = () => update([...addons, { id: `addon_${Date.now()}`, label: '', price: 500, note: '' }])
  const remove = (idx) => update(addons.filter((_, i) => i !== idx))

  const labelStyle = { display: 'block', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 3 }
  const inputStyle = { width: '100%', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 3, color: '#e0e8d8', fontSize: 12, padding: '7px 9px' }

  return (
    <div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 10 }}>
        ADD-ONS (OPTIONAL EXTRAS PLAYERS CAN ADD AT BOOKING)
      </div>

      {addons.length === 0 && (
        <p style={{ fontSize: 11, color: '#3a4a34', marginBottom: 10 }}>No add-ons for this event.</p>
      )}

      {addons.map((a, idx) => (
        <div key={idx} style={{ background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={labelStyle}>ADDON NAME</label>
              <input
                type="text"
                value={a.label}
                onChange={e => updateAddon(idx, 'label', e.target.value)}
                style={inputStyle}
                placeholder="e.g. Pyro Pack"
              />
            </div>
            <div>
              <label style={labelStyle}>PRICE (£)</label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={(a.price / 100).toFixed(2)}
                onChange={e => updateAddon(idx, 'price', e.target.value)}
                style={inputStyle}
                placeholder="10.00"
              />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>NOTE / RESTRICTION (shown to player)</label>
            <input
              type="text"
              value={a.note || ''}
              onChange={e => updateAddon(idx, 'note', e.target.value)}
              style={inputStyle}
              placeholder="e.g. 18+ only — UK firework regulations apply"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#3a4a34', fontFamily: '"JetBrains Mono", monospace' }}>
              Displays as: <strong style={{ color: '#6aaa48' }}>+£{(a.price / 100).toFixed(2)} per player</strong>
            </span>
            <button
              onClick={() => remove(idx)}
              style={{ fontSize: 10, padding: '3px 10px', borderRadius: 3, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}
            >
              REMOVE
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addNew}
        style={{ width: '100%', padding: '9px', background: 'transparent', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.35)', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5 }}
      >
        + ADD OPTIONAL EXTRA
      </button>
    </div>
  )
}

