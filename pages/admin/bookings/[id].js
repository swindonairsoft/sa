// pages/admin/bookings/[id].js
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/apiFetch'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { format } from 'date-fns'

export default function EditBooking({ session }) {
  const router  = useRouter()
  const { id }  = router.query
  const [booking,  setBooking]  = useState(null)
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')
  const [form,     setForm]     = useState({})

  useEffect(() => {
    if (!session || !id) return
    Promise.all([
      apiFetch(`/api/admin/bookings/${id}`).then(r => r.json()),
      apiFetch('/api/admin/events').then(r => r.json()),
    ]).then(([b, e]) => {
      setBooking(b.booking); setForm({ event_id: b.booking?.event_id, package_type: b.booking?.package_type, player_count: b.booking?.player_count, status: b.booking?.status })
      setEvents(e.events || [])
      setLoading(false)
    })
  }, [session, id])

  const save = async () => {
    setSaving(true); setMsg('')
    const res = await apiFetch(`/api/admin/bookings/${id}/update`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg('Saved successfully.'); setBooking(d.booking) }
    else setMsg(d.error || 'Error saving')
  }

  const handleMoveDate = async () => {
    const newEventId = form.event_id
    if (newEventId === booking.event_id) return setMsg('Select a different event to move to.')
    if (!confirm('Move this booking to the selected event?')) return
    setSaving(true)
    const res = await apiFetch(`/api/admin/bookings/${id}/move`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEventId }),
    })
    const d = await res.json()
    setSaving(false)
    setMsg(res.ok ? 'Booking moved. Confirmation email sent.' : d.error || 'Error')
  }

  const handleRefund = async () => {
    const reason = prompt('Refund reason:') || ''
    if (!confirm('Process full refund? This will also cancel the booking.')) return
    setSaving(true)
    const res = await apiFetch(`/api/admin/bookings/${id}/refund`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const d = await res.json()
    setSaving(false)
    setMsg(res.ok ? 'Refund processed.' : d.error || 'Error')
    if (res.ok) setBooking({ ...booking, status: 'refunded' })
  }

  const handleResendTicket = async () => {
    await apiFetch(`/api/admin/bookings/${id}/resend-ticket`, { method: 'POST' })
    setMsg('Ticket resent to player.')
  }

  if (loading) return <AdminLayout session={session} title="Edit Booking"><div className="max-w-3xl mx-auto px-4 py-20 text-center"><p style={{ color: '#4a5e42' }}>Loading…</p></div></AdminLayout>

  return (
    <AdminLayout session={session} title="Edit Booking">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/admin" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none', display: 'inline-flex', gap: 4, marginBottom: 24 }}>← Back to admin</Link>
        <div className="section-eyebrow">ADMIN</div>
        <h1 className="section-title" style={{ fontSize: 26, marginBottom: 20 }}>EDIT BOOKING</h1>

        {msg && <p style={{ fontSize: 12, color: msg.includes('Error') ? '#c04040' : '#6aaa48', marginBottom: 12 }}>{msg}</p>}

        {/* Booking info */}
        <div className="tac-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>BOOKING INFO</div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div style={{ fontSize: 10, color: '#4a5e42', marginBottom: 2, fontFamily: '"JetBrains Mono", monospace' }}>PLAYER</div>
              <div style={{ fontSize: 13, color: '#c0d0b8' }}>{booking?.profiles?.full_name}</div>
              <div style={{ fontSize: 11, color: '#4a5e42' }}>{booking?.profiles?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#4a5e42', marginBottom: 2, fontFamily: '"JetBrains Mono", monospace' }}>BOOKING REF</div>
              <div style={{ fontSize: 13, color: '#6aaa48', fontFamily: '"JetBrains Mono", monospace' }}>{booking?.booking_ref}</div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">MOVE TO EVENT</label>
              <select value={form.event_id || ''} onChange={e => setForm(p => ({ ...p, event_id: e.target.value }))} className="field-input">
                {events.map(e => (
                  <option key={e.id} value={e.id}>{format(new Date(e.event_date), 'd MMM yyyy')} — {e.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">PACKAGE</label>
              <select value={form.package_type || ''} onChange={e => setForm(p => ({ ...p, package_type: e.target.value }))} className="field-input">
                <option value="walkon">Walk-on</option>
                <option value="hire">Hire package</option>
              </select>
            </div>
            <div>
              <label className="field-label">PLAYER COUNT</label>
              <input type="number" min={1} max={20} value={form.player_count || 1} onChange={e => setForm(p => ({ ...p, player_count: Number(e.target.value) }))} className="field-input" />
            </div>
            <div>
              <label className="field-label">STATUS</label>
              <select value={form.status || ''} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="field-input">
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button onClick={save} disabled={saving} className="btn-primary" style={{ fontSize: 12 }}>{saving ? 'SAVING…' : 'SAVE CHANGES'}</button>
            <button onClick={handleMoveDate} disabled={saving} className="btn-ghost" style={{ fontSize: 12 }}>MOVE TO NEW DATE</button>
          </div>
        </div>

        {/* Actions */}
        <div className="tac-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>ACTIONS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleResendTicket} className="btn-ghost" style={{ fontSize: 12 }}>✉ RESEND TICKET</button>
            {booking?.status === 'confirmed' && (
              <button onClick={handleRefund} className="btn-danger" style={{ fontSize: 12 }}>PROCESS REFUND</button>
            )}
          </div>
          <p style={{ fontSize: 10, color: '#3a4a34', marginTop: 10 }}>Resending ticket will email the player their booking confirmation. Refunds are processed via Stripe and the player will be notified.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
