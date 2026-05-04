// pages/shop/index.js
import { useState } from 'react'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { getCategories, getAllProductsAdmin } from '@/lib/shop'

export default function ShopPage({ session, products = [], categories = [] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [sort, setSort] = useState('newest')

  const filtered = products
    .filter(p => activeCategory === 'all' || p.shop_categories?.slug === activeCategory)
    .sort((a, b) => {
      if (sort === 'price-asc')  return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return new Date(b.created_at) - new Date(a.created_at)
    })

  return (
    <Layout session={session} title="Shop" description="Airsoft gear, clothing and accessories from Swindon Airsoft.">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 6 }}>SWINDON AIRSOFT</div>
          <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 36, color: '#e0e8d8', letterSpacing: 2, marginBottom: 8 }}>SHOP</h1>
          <p style={{ fontSize: 13, color: '#4a5e42' }}>Gear, clothing and accessories. Free shipping on orders over £50.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Sidebar */}
          <div>
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 16, marginBottom: 12 }}>
              <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 10 }}>CATEGORIES</div>
              {[{ slug: 'all', name: 'All Products' }, ...categories].map(cat => (
                <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 2, borderRadius: 3, background: activeCategory === cat.slug ? 'rgba(106,170,72,0.1)' : 'transparent', color: activeCategory === cat.slug ? '#6aaa48' : '#6a7a64', border: `0.5px solid ${activeCategory === cat.slug ? 'rgba(106,170,72,0.3)' : 'transparent'}`, cursor: 'pointer', fontSize: 12 }}>
                  {cat.name}
                  <span style={{ float: 'right', fontSize: 10, color: '#3a4a34' }}>
                    {cat.slug === 'all' ? products.length : products.filter(p => p.shop_categories?.slug === cat.slug).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Info */}
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#3a4a34', lineHeight: 1.7 }}>
                <div style={{ color: '#6aaa48', fontWeight: 600, marginBottom: 4, fontSize: 12 }}>Delivery Info</div>
                <div>Standard: 3-5 days</div>
                <div>Express: 1-2 days</div>
                <div>Free over £50</div>
                <div style={{ marginTop: 8, color: '#6aaa48', fontWeight: 600, fontSize: 12 }}>Returns</div>
                <div>30-day returns</div>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div>
            {/* Sort bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#3a4a34' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', color: '#8a9a84', fontSize: 11, padding: '6px 10px', borderRadius: 4 }}>
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 48, textAlign: 'center' }}>
                <p style={{ color: '#2e3e28', fontSize: 13 }}>No products yet — check back soon.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {filtered.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function ProductCard({ product }) {
  const hasDiscount = product.compare_price && product.compare_price > product.price
  const savings = hasDiscount ? Math.round((1 - product.price / product.compare_price) * 100) : 0

  return (
    <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(106,170,72,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2a1a'; e.currentTarget.style.transform = 'none' }}>
        {/* Product image */}
        <div style={{ height: 180, background: 'linear-gradient(135deg,#0f2210,#1a3a12)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.2">
              <rect x="4" y="8" width="32" height="24" rx="2" stroke="#6aaa48" strokeWidth="1.5"/>
              <circle cx="14" cy="17" r="3" stroke="#6aaa48" strokeWidth="1.5"/>
              <path d="M4 26l8-6 6 4 8-8 10 10" stroke="#6aaa48" strokeWidth="1.5"/>
            </svg>
          )}
          {hasDiscount && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: '#c04040', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 2 }}>
              -{savings}%
            </div>
          )}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: '#c04040', fontFamily: '"JetBrains Mono",monospace', letterSpacing: 2 }}>OUT OF STOCK</span>
            </div>
          )}
          {product.requires_ukara && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(200,160,48,0.9)', color: '#0a0f05', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 2, fontFamily: '"JetBrains Mono",monospace' }}>
              UKARA REQ.
            </div>
          )}
        </div>

        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono",monospace', letterSpacing: 1, marginBottom: 4 }}>
            {product.shop_categories?.name?.toUpperCase() || 'GEAR'}
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#c0d0b8', marginBottom: 8, lineHeight: 1.3 }}>{product.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#6aaa48' }}>£{(product.price / 100).toFixed(2)}</span>
            {hasDiscount && (
              <span style={{ fontSize: 12, color: '#4a5e42', textDecoration: 'line-through' }}>£{(product.compare_price / 100).toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export async function getServerSideProps() {
  try {
    const [products, categories] = await Promise.all([getAllProductsAdmin(), getCategories()])
    const activeProducts = products.filter(p => p.is_active)
    return { props: { products: activeProducts, categories } }
  } catch {
    return { props: { products: [], categories: [] } }
  }
}
