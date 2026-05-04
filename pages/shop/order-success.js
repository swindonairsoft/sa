// pages/shop/order-success.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

export default function OrderSuccessPage({ session }) {
  const router = useRouter()
  const { ref } = router.query
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ref) return
    apiFetch(`/api/shop/order?ref=${ref}`)
      .then(r => r.json())
      .then(d => { setOrder(d.order); setLoading(false) })
      .catch(() => setLoading(false))
  }, [ref])

  return (
    <Layout session={session} title="Order Confirmed">
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(106,170,72,0.15)', border: '1px solid rgba(106,170,72,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
        <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 36, color: '#6aaa48', letterSpacing: 2, marginBottom: 8 }}>ORDER CONFIRMED!</h1>
        <p style={{ fontSize: 14, color: '#5a6e52', marginBottom: 28 }}>Your order has been placed. A confirmation has been sent to your email.</p>

        {!loading && order && (
          <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 24, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 14 }}>ORDER DETAILS</div>
            {[
              ['Order Ref',  order.order_ref],
              ['Date',       order.created_at ? format(new Date(order.created_at), 'd MMM yyyy HH:mm') : '—'],
              ['Status',     order.status?.toUpperCase()],
              ['Total',      `£${((order.total || 0) / 100).toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #1e2a1a', fontSize: 13 }}>
                <span style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono",monospace', fontSize: 10 }}>{label.toUpperCase()}</span>
                <span style={{ color: label === 'Order Ref' ? '#6aaa48' : '#c0d0b8', fontWeight: label === 'Order Ref' ? 600 : 400 }}>{value}</span>
              </div>
            ))}
            {/* Items */}
            {order.items?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 1, marginBottom: 8 }}>ITEMS</div>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6a7a64', padding: '4px 0' }}>
                    <span>{item.product} {item.variants ? `(${Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(', ')})` : ''} × {item.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ background: 'rgba(106,170,72,0.05)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 6, padding: 16, marginBottom: 24, fontSize: 12, color: '#4a5e42', lineHeight: 1.7 }}>
          Your order will be dispatched within 1-2 working days. You can track your order in <strong style={{ color: '#8aaa68' }}>My Profile → Orders</strong> once a tracking number is assigned.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>VIEW MY ORDERS</Link>
          <Link href="/shop" className="btn-ghost" style={{ textDecoration: 'none' }}>CONTINUE SHOPPING</Link>
        </div>
      </div>
    </Layout>
  )
}
