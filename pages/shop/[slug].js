// pages/shop/[slug].js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { getProductBySlug, getCategories } from '@/lib/shop'

export default function ProductPage({ session, product }) {
  const router = useRouter()
  const [qty,       setQty]       = useState(1)
  const [variants,  setVariants]  = useState({})
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [imgIdx,    setImgIdx]    = useState(0)

  if (!product) return (
    <Layout session={session} title="Product Not Found">
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <p style={{ color: '#4a5e42' }}>Product not found.</p>
        <Link href="/shop" style={{ color: '#6aaa48', textDecoration: 'none' }}>← Back to shop</Link>
      </div>
    </Layout>
  )

  const hasDiscount = product.compare_price && product.compare_price > product.price
  const savings = hasDiscount ? Math.round((1 - product.price / product.compare_price) * 100) : 0
  const variantsList = product.variants || []

  const handleBuy = async () => {
    if (!session) return router.push('/auth/login')
    if (product.requires_ukara) {
      const profileRes = await apiFetch('/api/profile/get')
      const profileData = await profileRes.json()
      if (!profileData.profile?.ukara_number) {
        return setError('This product requires a valid UKARA number. Apply in your profile.')
      }
    }
    setLoading(true); setError('')
    try {
      const res = await apiFetch('/api/shop/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: [{ productId: product.id, qty, variants }] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.checkoutUrl
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout session={session} title={product.name}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
        <Link href="/shop" style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Back to shop</Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ height: 400, background: 'linear-gradient(135deg,#0f2210,#1a3a12)', borderRadius: 6, border: '0.5px solid #1e2a1a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {product.images?.[imgIdx] ? (
                <img src={product.images[imgIdx]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" opacity="0.15">
                  <rect x="6" y="12" width="48" height="36" rx="3" stroke="#6aaa48" strokeWidth="2"/>
                  <circle cx="21" cy="25.5" r="4.5" stroke="#6aaa48" strokeWidth="2"/>
                  <path d="M6 39l12-9 9 6 12-12 15 15" stroke="#6aaa48" strokeWidth="2"/>
                </svg>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} style={{ width: 60, height: 60, borderRadius: 4, overflow: 'hidden', border: `1.5px solid ${imgIdx === i ? '#6aaa48' : '#1e2a1a'}`, cursor: 'pointer', padding: 0, background: '#0d1209' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 8 }}>
              {product.shop_categories?.name?.toUpperCase() || 'GEAR'}
            </div>
            <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2, marginBottom: 8, lineHeight: 1 }}>{product.name}</h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 32, color: '#6aaa48', letterSpacing: 1 }}>
                £{(product.price / 100).toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: 16, color: '#4a5e42', textDecoration: 'line-through' }}>£{(product.compare_price / 100).toFixed(2)}</span>
                  <span style={{ fontSize: 11, background: '#c04040', color: '#fff', padding: '2px 7px', borderRadius: 2, fontWeight: 700 }}>SAVE {savings}%</span>
                </>
              )}
            </div>

            {/* UKARA badge */}
            {product.requires_ukara && (
              <div style={{ background: 'rgba(200,160,48,0.08)', border: '0.5px solid rgba(200,160,48,0.3)', borderRadius: 4, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: '#c8a030' }}>
                ⚠ UKARA registration required to purchase this item.{' '}
                <Link href="/profile/ukara" style={{ color: '#c8a030' }}>Apply →</Link>
              </div>
            )}

            {/* Variants */}
            {variantsList.map(variant => (
              <div key={variant.name} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 6 }}>{variant.name.toUpperCase()}</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {variant.options.map(opt => (
                    <button key={opt} onClick={() => setVariants(p => ({ ...p, [variant.name]: opt }))}
                      style={{ padding: '6px 14px', borderRadius: 3, cursor: 'pointer', fontSize: 12, background: variants[variant.name] === opt ? 'rgba(106,170,72,0.15)' : 'transparent', color: variants[variant.name] === opt ? '#6aaa48' : '#6a7a64', border: `0.5px solid ${variants[variant.name] === opt ? 'rgba(106,170,72,0.4)' : '#1e2a1a'}` }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Qty */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 6 }}>QUANTITY</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, background: '#0d1209', border: '0.5px solid #1e2a1a', borderRight: 'none', borderRadius: '4px 0 0 4px', color: '#8a9a84', fontSize: 16, cursor: 'pointer' }}>−</button>
                <div style={{ width: 48, height: 36, background: '#080c07', border: '0.5px solid #1e2a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#e0e8d8' }}>{qty}</div>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} style={{ width: 36, height: 36, background: '#0d1209', border: '0.5px solid #1e2a1a', borderLeft: 'none', borderRadius: '0 4px 4px 0', color: '#8a9a84', fontSize: 16, cursor: 'pointer' }}>+</button>
              </div>
              {product.stock > 0 && product.stock < 10 && (
                <p style={{ fontSize: 11, color: '#c8a030', marginTop: 4 }}>⚠ Only {product.stock} left in stock</p>
              )}
            </div>

            {/* Total */}
            <div style={{ borderTop: '0.5px solid #1e2a1a', paddingTop: 14, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34' }}>TOTAL (QTY {qty})</div>
              <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 24, color: '#6aaa48', letterSpacing: 1 }}>£{((product.price * qty) / 100).toFixed(2)}</div>
            </div>

            {error && <p style={{ fontSize: 12, color: '#c04040', marginBottom: 10 }}>{error}</p>}

            <button onClick={handleBuy} disabled={loading || product.stock === 0}
              style={{ width: '100%', padding: 13, background: product.stock === 0 ? '#1e2a1a' : '#5a8c3a', color: product.stock === 0 ? '#3a4a34' : '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}>
              {loading ? 'PROCESSING…' : product.stock === 0 ? 'OUT OF STOCK' : 'BUY NOW →'}
            </button>

            <p style={{ fontSize: 10, color: '#2e3e28', textAlign: 'center', marginTop: 8 }}>Secure checkout via Stripe · Free returns within 30 days</p>

            {/* Description */}
            {product.description && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '0.5px solid #1e2a1a' }}>
                <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 8 }}>PRODUCT DETAILS</div>
                <p style={{ fontSize: 13, color: '#6a7a64', lineHeight: 1.7 }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(ctx) {
  const { slug } = ctx.params
  try {
    const product = await getProductBySlug(slug)
    return { props: { product: product || null } }
  } catch {
    return { props: { product: null } }
  }
}
