// pages/admin/shop/orders/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'
import { CARRIERS, detectCarrier, getTrackingUrl } from '@/lib/tracking'

export default function AdminOrderPage({ session }) {
  const router = useRouter()
  const { id }  = router.query
  const [order,     setOrder]    = useState(null)
  const [loading,   setLoading]  = useState(true)
  const [saving,    setSaving]   = useState(false)
  const [msg,       setMsg]      = useState('')
  const [authState, setAuth]     = useState('checking')
  const [tracking,  setTracking] = useState({ number: '', carrier: 'royalmail' })

  useEffect(() => {
    if (session === undefined || !id) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok'); loadOrder()
    })
  }, [session, id])

  const loadOrder = async () => {
    const res = await apiFetch(`/api/admin/shop/orders/${id}`)
    const d = await res.json()
    setOrder(d.order || null)
    if (d.order?.tracking_number) {
      setTracking({ number: d.order.tracking_number, carrier: d.order.tracking_carrier || 'royalmail' })
    }
    setLoading(false)
  }

  // Auto-detect carrier from tracking number
  const handleTrackingNumberChange = (num) => {
    const detected = detectCarrier(num)
    setTracking(p => ({ ...p, number: num, carrier: detected !== 'other' ? detected : p.carrier }))
  }

  const handleSaveTracking = async () => {
    if (!tracking.number) return setMsg('Enter a tracking number.')
    setSaving(true); setMsg('')
    const trackUrl = getTrackingUrl(tracking.number, tracking.carrier)
    const res = await apiFetch(`/api/admin/shop/orders/${id}/update`, {
      method: 'POST',
      body: JSON.stringify({
        tracking_number:  tracking.number,
        tracking_carrier: tracking.carrier,
        tracking_url:     trackUrl,
        tracking_updated_at: new Date().toISOString(),
        status: 'shipped',
      }),
    })
    const d = await res.json()
    setSaving(false)
    if (res.ok) { setMsg('Tracking saved. Order marked as shipped.'); setOrder(d.order) }
    else setMsg(d.error || 'Error')
  }

  const handleStatusChange = async (status) => {
    const res = await apiFetch(`/api/admin/shop/orders/${id}/update`, {
      method: 'POST', body: JSON.stringify({ status }),
    })
    const d = await res.json()
    if (res.ok) { setOrder(d.order); setMsg(`Status updated to ${status}.`) }
    else setMsg(d.error || 'Error')
  }

  const STATUS_COLORS = { pending:'#c8a030', paid:'#4888c8', processing:'#a078d0', shipped:'#6aaa48', delivered:'#6aaa48', cancelled:'#c04040', refunded:'#4888c8' }

  if (authState !== 'ok') return (
    <AdminLayout session={session} title="Order"><div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center' }}><p style={{ color:'#4a5e42',fontFamily:'"JetBrains Mono",monospace',fontSize:11 }}>LOADING…</p></div></AdminLayout>
  )

  const inputStyle = { width: '100%', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, color: '#e0e8d8', fontSize: 12, padding: '9px 12px' }
  const labelStyle = { display: 'block', fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 4 }

  return (
    <AdminLayout session={session} title="Manage Order">
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        <Link href="/admin/shop" style={{ fontSize: 11, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Shop management</Link>
        <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
        <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2, marginBottom: 20 }}>
          ORDER {order?.order_ref || '…'}
        </h1>

        {msg && (
          <div style={{ fontSize: 12, color: msg.includes('rror') ? '#c04040' : '#6aaa48', marginBottom: 16, padding: '10px 14px', background: 'rgba(106,170,72,0.06)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 4 }}>
            {msg}
          </div>
        )}

        {loading ? <p style={{ color: '#4a5e42' }}>Loading…</p> : !order ? (
          <p style={{ color: '#c04040' }}>Order not found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Order details */}
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20 }}>
                <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 14 }}>ORDER DETAILS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    ['Customer',   order.profiles?.full_name],
                    ['Email',      order.profiles?.email],
                    ['Ordered',    order.created_at ? format(new Date(order.created_at), 'd MMM yyyy HH:mm') : '—'],
                    ['Subtotal',   `£${((order.subtotal || 0) / 100).toFixed(2)}`],
                    ['Shipping',   order.shipping_cost === 0 ? 'FREE' : `£${((order.shipping_cost || 0) / 100).toFixed(2)}`],
                    ['Total',      `£${((order.total || 0) / 100).toFixed(2)}`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={labelStyle}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: '#c0d0b8' }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div style={{ borderTop: '0.5px solid #1e2a1a', paddingTop: 14 }}>
                  <div style={labelStyle}>ITEMS ORDERED</div>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #1a2218', fontSize: 12 }}>
                      <span style={{ color: '#8a9a84' }}>
                        {item.product}
                        {item.variants && Object.keys(item.variants).length > 0 && (
                          <span style={{ color: '#4a5e42', marginLeft: 6 }}>
                            ({Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(', ')})
                          </span>
                        )}
                        {' '} × {item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                {order.shipping_address && (
                  <div style={{ borderTop: '0.5px solid #1e2a1a', paddingTop: 14, marginTop: 14 }}>
                    <div style={labelStyle}>SHIP TO</div>
                    <div style={{ fontSize: 12, color: '#6a7a64', lineHeight: 1.7 }}>
                      {order.shipping_name && <div>{order.shipping_name}</div>}
                      {order.shipping_address.line1 && <div>{order.shipping_address.line1}</div>}
                      {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                      {order.shipping_address.city && <div>{order.shipping_address.city}</div>}
                      {order.shipping_address.postal_code && <div>{order.shipping_address.postal_code}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Tracking entry */}
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20 }}>
                <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 14 }}>📦 ADD / UPDATE TRACKING</div>

                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>CARRIER</label>
                  <select value={tracking.carrier} onChange={e => setTracking(p => ({ ...p, carrier: e.target.value }))} style={inputStyle}>
                    {CARRIERS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>TRACKING NUMBER</label>
                  <input
                    type="text"
                    value={tracking.number}
                    onChange={e => handleTrackingNumberChange(e.target.value)}
                    style={inputStyle}
                    placeholder="e.g. JD000000000000000000"
                  />
                  {tracking.number && (
                    <p style={{ fontSize: 10, color: '#4a5e42', marginTop: 4 }}>
                      Auto-detected: <strong style={{ color: '#6aaa48' }}>{CARRIERS.find(c => c.id === tracking.carrier)?.label}</strong>
                      {' · '}
                      <a href={getTrackingUrl(tracking.number, tracking.carrier)} target="_blank" rel="noopener noreferrer" style={{ color: '#4888c8' }}>
                        Test tracking link →
                      </a>
                    </p>
                  )}
                </div>

                <button onClick={handleSaveTracking} disabled={saving} style={{ width: '100%', padding: '10px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'SAVING…' : '📦 SAVE TRACKING & MARK SHIPPED'}
                </button>

                {order.tracking_number && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(106,170,72,0.05)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: '#3a4a34', fontFamily: '"JetBrains Mono",monospace', marginBottom: 4 }}>CURRENT TRACKING</div>
                    <div style={{ fontSize: 12, color: '#6aaa48', fontFamily: '"JetBrains Mono",monospace' }}>{order.tracking_number}</div>
                    <div style={{ fontSize: 10, color: '#3a4a34', marginTop: 2 }}>{CARRIERS.find(c => c.id === order.tracking_carrier)?.label || order.tracking_carrier}</div>
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#4888c8', display: 'inline-block', marginTop: 6, textDecoration: 'none' }}>
                        Track parcel →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Status */}
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 16 }}>
                <div style={labelStyle}>ORDER STATUS</div>
                <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 22, color: STATUS_COLORS[order.status] || '#6a7a64', letterSpacing: 1, marginBottom: 12 }}>
                  {order.status?.toUpperCase()}
                </div>
                <div style={labelStyle}>CHANGE STATUS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['pending','paid','processing','shipped','delivered','cancelled','refunded'].map(s => (
                    <button key={s} onClick={() => handleStatusChange(s)} style={{ padding: '8px 12px', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontWeight: order.status === s ? 600 : 400, background: order.status === s ? `${STATUS_COLORS[s]}20` : 'transparent', color: order.status === s ? STATUS_COLORS[s] : '#4a5e42', border: `0.5px solid ${order.status === s ? STATUS_COLORS[s] + '40' : '#1e2a1a'}`, textAlign: 'left', fontFamily: '"JetBrains Mono",monospace', letterSpacing: 0.5 }}>
                      {order.status === s ? '● ' : '○ '}{s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 16 }}>
                <div style={labelStyle}>ORDER NOTES</div>
                <textarea
                  defaultValue={order.notes || ''}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Internal notes about this order…"
                  onBlur={async (e) => {
                    await apiFetch(`/api/admin/shop/orders/${id}/update`, {
                      method: 'POST', body: JSON.stringify({ notes: e.target.value }),
                    })
                  }}
                />
                <p style={{ fontSize: 10, color: '#2e3e28', marginTop: 4 }}>Auto-saves when you click away</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
