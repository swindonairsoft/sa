// pages/admin/shop/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'

const BLANK_PRODUCT = {
  name: '', slug: '', description: '', category_id: '',
  price: '', compare_price: '', stock: 0,
  requires_ukara: false, is_active: true,
  variants: [], images: [],
}

export default function AdminShopPage({ session }) {
  const router = useRouter()
  const [tab,        setTab]       = useState('products')
  const [products,   setProducts]  = useState([])
  const [categories, setCategories]= useState([])
  const [orders,     setOrders]    = useState([])
  const [editing,    setEditing]   = useState(null)
  const [form,       setForm]      = useState(BLANK_PRODUCT)
  const [catForm,    setCatForm]   = useState({ name: '', slug: '', description: '' })
  const [saving,     setSaving]    = useState(false)
  const [msg,        setMsg]       = useState('')
  const [authState,  setAuth]      = useState('checking')
  const [orderFilter,setOrderFilter]=useState('all')

  useEffect(() => {
    if (session === undefined) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok'); loadAll()
    })
  }, [session])

  const loadAll = () => {
    Promise.all([
      apiFetch('/api/admin/shop/products').then(r => r.json()),
      apiFetch('/api/admin/shop/categories').then(r => r.json()),
      apiFetch('/api/admin/shop/orders').then(r => r.json()),
    ]).then(([p, c, o]) => {
      setProducts(p.products || [])
      setCategories(c.categories || [])
      setOrders(o.orders || [])
    })
  }

  const openNew  = () => { setForm(BLANK_PRODUCT); setEditing('new'); setMsg('') }
  const openEdit = (p) => {
    setForm({
      ...p,
      price:         ((p.price || 0) / 100).toFixed(2),
      compare_price: p.compare_price ? (p.compare_price / 100).toFixed(2) : '',
    })
    setEditing(p); setMsg('')
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    const payload = {
      ...form,
      price:         Math.round(parseFloat(form.price || 0) * 100),
      compare_price: form.compare_price ? Math.round(parseFloat(form.compare_price) * 100) : null,
      slug:          form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }
    const isNew = editing === 'new'
    const url   = isNew ? '/api/admin/shop/products/create' : `/api/admin/shop/products/${editing.id}/update`
    const res   = await apiFetch(url, { method: 'POST', body: JSON.stringify(payload) })
    const d     = await res.json()
    setSaving(false)
    if (res.ok) { setMsg(isNew ? 'Product created.' : 'Product updated.'); setEditing(null); loadAll() }
    else setMsg(d.error || 'Error')
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await apiFetch(`/api/admin/shop/products/${id}/delete`, { method: 'POST' })
    loadAll()
  }

  const handleAddCategory = async () => {
    if (!catForm.name) return
    const payload = { ...catForm, slug: catForm.slug || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
    const res = await apiFetch('/api/admin/shop/categories/create', { method: 'POST', body: JSON.stringify(payload) })
    const d = await res.json()
    if (res.ok) { setCatForm({ name: '', slug: '', description: '' }); loadAll() }
    else setMsg(d.error || 'Error creating category')
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    await apiFetch(`/api/admin/shop/orders/${orderId}/update`, { method: 'POST', body: JSON.stringify({ status }) })
    loadAll()
  }

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter)

  const inputStyle = { width: '100%', background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, color: '#e0e8d8', fontSize: 12, padding: '8px 10px' }
  const labelStyle = { display: 'block', fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 1, marginBottom: 4 }

  if (authState !== 'ok') return (
    <Layout session={session} title="Admin Shop">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono",monospace', fontSize: 11 }}>LOADING…</p>
      </div>
    </Layout>
  )

  const STATUS_COLORS = { pending:'#c8a030', paid:'#4888c8', processing:'#a078d0', shipped:'#6aaa48', delivered:'#6aaa48', cancelled:'#c04040', refunded:'#4888c8' }

  return (
    <Layout session={session} title="Admin Shop">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/admin" style={{ fontSize: 11, color: '#4a5e42', textDecoration: 'none', display: 'inline-block', marginBottom: 6 }}>← Admin dashboard</Link>
            <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 4 }}>ADMIN</div>
            <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 2 }}>SHOP MANAGEMENT</h1>
          </div>
          <Link href="/shop" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 4, background: 'rgba(106,170,72,0.08)', color: '#8aaa68', border: '0.5px solid rgba(106,170,72,0.25)', textDecoration: 'none' }}>VIEW SHOP →</Link>
        </div>

        {msg && (
          <div style={{ fontSize: 12, color: msg.includes('rror') ? '#c04040' : '#6aaa48', marginBottom: 16, padding: '10px 14px', background: 'rgba(106,170,72,0.06)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 4 }}>
            {msg} <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', color: '#4a5e42', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '0.5px solid #1e2a1a' }}>
          {[['products','PRODUCTS'], ['orders','ORDERS'], ['categories','CATEGORIES']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', fontSize: 11, fontFamily: '"JetBrains Mono",monospace', letterSpacing: 1, background: 'transparent', color: tab === t ? '#6aaa48' : '#3a4a34', border: 'none', borderBottom: `2px solid ${tab === t ? '#6aaa48' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              {label} {t === 'orders' && <span style={{ marginLeft: 4, background: 'rgba(106,170,72,0.15)', color: '#6aaa48', padding: '1px 5px', borderRadius: 2, fontSize: 9 }}>{orders.filter(o => o.status === 'paid' || o.status === 'processing').length}</span>}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <>
            {editing ? (
              <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 24, marginBottom: 20 }}>
                <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 20, color: '#e0e8d8', letterSpacing: 2, marginBottom: 20 }}>
                  {editing === 'new' ? 'ADD NEW PRODUCT' : `EDITING: ${editing.name}`}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>PRODUCT NAME *</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-') }))} style={inputStyle} placeholder="e.g. Airsoft Face Mask" />
                  </div>
                  <div>
                    <label style={labelStyle}>URL SLUG</label>
                    <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} style={inputStyle} placeholder="auto-generated from name" />
                  </div>
                  <div>
                    <label style={labelStyle}>CATEGORY</label>
                    <select value={form.category_id || ''} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} style={inputStyle}>
                      <option value="">No category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>PRICE (£) *</label>
                    <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} style={inputStyle} placeholder="19.99" />
                  </div>
                  <div>
                    <label style={labelStyle}>COMPARE PRICE (£) — for sale</label>
                    <input type="number" step="0.01" min="0" value={form.compare_price} onChange={e => setForm(p => ({ ...p, compare_price: e.target.value }))} style={inputStyle} placeholder="24.99" />
                  </div>
                  <div>
                    <label style={labelStyle}>STOCK QTY</label>
                    <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>DESCRIPTION</label>
                    <textarea rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>IMAGE URLS (one per line)</label>
                    <textarea rows={3} value={(form.images || []).join('\n')} onChange={e => setForm(p => ({ ...p, images: e.target.value.split('\n').filter(Boolean) }))} style={{ ...inputStyle, resize: 'vertical', fontFamily: '"JetBrains Mono",monospace', fontSize: 11 }} placeholder="https://..." />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>VARIANTS (e.g. Size: S,M,L,XL — one per line as "Name: opt1,opt2")</label>
                    <textarea rows={2} value={(form.variants || []).map(v => `${v.name}: ${v.options.join(',')}`).join('\n')}
                      onChange={e => setForm(p => ({
                        ...p,
                        variants: e.target.value.split('\n').filter(Boolean).map(line => {
                          const [name, opts] = line.split(':')
                          return { name: name?.trim(), options: (opts || '').split(',').map(o => o.trim()).filter(Boolean) }
                        }).filter(v => v.name)
                      }))}
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: '"JetBrains Mono",monospace', fontSize: 11 }}
                      placeholder={"Size: S,M,L,XL\nColour: Black,Tan,Green"} />
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8a9a84', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.requires_ukara} onChange={e => setForm(p => ({ ...p, requires_ukara: e.target.checked }))} style={{ accentColor: '#6aaa48' }} />
                      Requires UKARA
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8a9a84', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: '#6aaa48' }} />
                      Active (visible in shop)
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {saving ? 'SAVING…' : editing === 'new' ? 'CREATE PRODUCT' : 'SAVE CHANGES'}
                  </button>
                  <button onClick={() => setEditing(null)} style={{ padding: '10px 16px', background: 'transparent', color: '#4a5e42', border: '0.5px solid #1e2a1a', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>CANCEL</button>
                </div>
              </div>
            ) : (
              <button onClick={openNew} style={{ marginBottom: 16, padding: '10px 18px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                + ADD NEW PRODUCT
              </button>
            )}

            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr>
                      {['PRODUCT','CATEGORY','PRICE','STOCK','UKARA','STATUS','ACTIONS'].map(h => (
                        <th key={h} style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', padding: '8px 12px', textAlign: 'left', borderBottom: '0.5px solid #1e2a1a', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '0.5px solid rgba(30,42,26,0.4)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: '#c0d0b8', fontWeight: 500, fontSize: 12 }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: '#3a4a34', fontFamily: '"JetBrains Mono",monospace' }}>{p.slug}</div>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: '#6a7a64' }}>{p.shop_categories?.name || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 13, color: '#6aaa48', fontWeight: 600 }}>£{(p.price / 100).toFixed(2)}</div>
                          {p.compare_price && <div style={{ fontSize: 10, color: '#4a5e42', textDecoration: 'line-through' }}>£{(p.compare_price / 100).toFixed(2)}</div>}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: p.stock < 5 ? '#c04040' : '#6a7a64', fontWeight: p.stock < 5 ? 600 : 400 }}>{p.stock}</td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: p.requires_ukara ? '#c8a030' : '#3a4a34' }}>{p.requires_ukara ? 'YES' : 'No'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 2, background: p.is_active ? 'rgba(106,170,72,0.1)' : 'rgba(192,64,64,0.1)', color: p.is_active ? '#6aaa48' : '#c04040', border: `0.5px solid ${p.is_active ? 'rgba(106,170,72,0.3)' : 'rgba(192,64,64,0.3)'}` }}>
                            {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => openEdit(p)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.25)', cursor: 'pointer' }}>EDIT</button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}>DELETE</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2e3e28', padding: 32, fontSize: 12 }}>No products yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['all','pending','paid','processing','shipped','delivered','cancelled'].map(s => (
                <button key={s} onClick={() => setOrderFilter(s)} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 2, cursor: 'pointer', background: orderFilter === s ? 'rgba(106,170,72,0.1)' : 'transparent', color: orderFilter === s ? '#6aaa48' : '#4a5e42', border: `0.5px solid ${orderFilter === s ? 'rgba(106,170,72,0.3)' : '#1e2a1a'}`, fontFamily: '"JetBrains Mono",monospace', letterSpacing: 1 }}>
                  {s.toUpperCase()} ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
                </button>
              ))}
            </div>

            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr>
                      {['ORDER REF','CUSTOMER','ITEMS','TOTAL','STATUS','TRACKING','ACTIONS'].map(h => (
                        <th key={h} style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', padding: '8px 12px', textAlign: 'left', borderBottom: '0.5px solid #1e2a1a', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '0.5px solid rgba(30,42,26,0.4)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: '#6aaa48' }}>{o.order_ref}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 12, color: '#c0d0b8' }}>{o.profiles?.full_name}</div>
                          <div style={{ fontSize: 10, color: '#3a4a34' }}>{o.profiles?.email}</div>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: '#6a7a64' }}>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: '#6aaa48', fontWeight: 600 }}>£{((o.total || 0) / 100).toFixed(2)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <select value={o.status} onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                            style={{ background: '#080c07', border: `0.5px solid ${STATUS_COLORS[o.status] || '#1e2a1a'}44`, borderRadius: 3, color: STATUS_COLORS[o.status] || '#6a7a64', fontSize: 10, padding: '3px 6px', fontFamily: '"JetBrains Mono",monospace', cursor: 'pointer' }}>
                            {['pending','paid','processing','shipped','delivered','cancelled','refunded'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {o.tracking_number ? (
                            <div>
                              <div style={{ fontSize: 10, color: '#6aaa48', fontFamily: '"JetBrains Mono",monospace' }}>{o.tracking_number}</div>
                              <div style={{ fontSize: 9, color: '#3a4a34' }}>{o.tracking_carrier?.toUpperCase()}</div>
                            </div>
                          ) : <span style={{ fontSize: 10, color: '#2e3e28' }}>Not yet shipped</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Link href={`/admin/shop/orders/${o.id}`} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.25)', textDecoration: 'none' }}>MANAGE</Link>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2e3e28', padding: 32, fontSize: 12 }}>No orders found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── CATEGORIES TAB ── */}
        {tab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['CATEGORY','SLUG','PRODUCTS',''].map(h => (
                      <th key={h} style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', padding: '8px 12px', textAlign: 'left', borderBottom: '0.5px solid #1e2a1a', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id} style={{ borderBottom: '0.5px solid rgba(30,42,26,0.4)' }}>
                      <td style={{ padding: '10px 12px', color: '#c0d0b8', fontSize: 12, fontWeight: 500 }}>{c.name}</td>
                      <td style={{ padding: '10px 12px', fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono",monospace' }}>{c.slug}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#6a7a64' }}>{products.filter(p => p.category_id === c.id).length}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={async () => { if (!confirm('Delete category?')) return; await apiFetch(`/api/admin/shop/categories/${c.id}/delete`, { method: 'POST' }); loadAll() }} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}>DELETE</button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#2e3e28', padding: 24, fontSize: 12 }}>No categories yet.</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6, padding: 20 }}>
              <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: '#3a4a34', letterSpacing: 2, marginBottom: 14 }}>ADD CATEGORY</div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>NAME *</label>
                <input type="text" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-') }))} style={inputStyle} placeholder="e.g. Clothing" />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>SLUG</label>
                <input type="text" value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>DESCRIPTION (OPTIONAL)</label>
                <textarea rows={2} value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <button onClick={handleAddCategory} style={{ width: '100%', padding: '10px', background: '#5a8c3a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>ADD CATEGORY</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
