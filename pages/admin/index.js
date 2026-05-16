// pages/admin/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

export default function AdminDashboard({ session }) {
  const router = useRouter()
  const [data,      setData]      = useState(null)
  const [filter,    setFilter]    = useState('all')
  const [authState, setAuthState] = useState('checking')
  const [msg,       setMsg]       = useState('')

  useEffect(() => {
    if (session === undefined) return
    if (session === null) { setTimeout(() => router.push('/auth/login?redirect=/admin'), 1000); return }
    apiFetch('/api/admin/dashboard').then(r => r.json()).then(d => {
      if (d.error) { setAuthState('denied'); return }
      setData(d); setAuthState('admin')
    }).catch(() => setAuthState('denied'))
  }, [session])

  const reload = () => apiFetch('/api/admin/dashboard').then(r=>r.json()).then(setData)

  const handleWaiverAction = async (id, isEdit, action) => {
    await apiFetch(`/api/admin/waivers/${action}`, { method:'POST', body:JSON.stringify({ id, isEdit }) })
    setMsg(`Waiver ${action}d.`); reload()
  }
  const handleResend = async (id) => { await apiFetch(`/api/admin/bookings/${id}/resend-ticket`, { method:'POST' }); setMsg('Ticket resent.') }
  const handleRefund = async (id) => {
    if (!confirm('Process refund?')) return
    const r = prompt('Reason (optional):') || ''
    const res = await apiFetch(`/api/admin/bookings/${id}/refund`, { method:'POST', body:JSON.stringify({ reason:r }) })
    const d = await res.json()
    setMsg(res.ok ? 'Refund processed.' : d.error || 'Error'); reload()
  }

  if (authState === 'checking') return <AdminLayout session={session} title="Admin"><div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#4a5e42', fontFamily:'"JetBrains Mono",monospace', fontSize:11 }}>LOADING…</p></div></AdminLayout>
  if (authState === 'denied')   return <AdminLayout session={session} title="Denied"><div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ textAlign:'center' }}><div style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:32, color:'#c04040', letterSpacing:2 }}>ACCESS DENIED</div></div></div></AdminLayout>

  const { stats={}, bookings=[], events=[], waiverQueue={ new:[], edits:[] } } = data || {}
  const pending = [...(waiverQueue.new||[]).map(w=>({...w,_type:'new'})), ...(waiverQueue.edits||[]).map(w=>({...w,_type:'edit'}))]
  const filtered = filter==='all' ? bookings : bookings.filter(b=>b.event_id===filter)
  const SC = { confirmed:'#6aaa48', refunded:'#4888c8', pending:'#c8a030', cancelled:'#c04040' }

  return (
    <AdminLayout session={session} title="Admin Dashboard">
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, color:'#6aaa48', letterSpacing:2, marginBottom:4 }}>🔒 SECURE AREA</div>
            <h1 style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:32, color:'#e0e8d8', letterSpacing:2 }}>ADMIN DASHBOARD</h1>
          </div>
          <button onClick={reload} style={{ fontSize:11, padding:'7px 14px', background:'transparent', color:'#4a5e42', border:'0.5px solid #1e2a1a', borderRadius:4, cursor:'pointer', fontFamily:'"JetBrains Mono",monospace' }}>↻ REFRESH</button>
        </div>

        {msg && <div style={{ fontSize:12, color:msg.includes('ail')||msg.includes('rror')?'#c04040':'#6aaa48', marginBottom:20, padding:'10px 14px', background:'rgba(106,170,72,0.06)', border:'0.5px solid rgba(106,170,72,0.15)', borderRadius:4, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} style={{ background:'none', border:'none', color:'#4a5e42', cursor:'pointer' }}>×</button></div>}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12, marginBottom:24 }}>
          {[
            { label:'Revenue this month', value:`£${((stats.monthRevenue||0)/100).toFixed(2)}`, sub:`+${stats.weekBookings||0} this week`, color:'#6aaa48' },
            { label:'Bookings this month', value:stats.monthBookings||0, sub:'Confirmed', color:'#e0e8d8' },
            { label:'Pending waivers', value:pending.length, sub:'Awaiting review', color:pending.length>0?'#c8a030':'#6aaa48' },
            { label:'Pending payments', value:stats.pendingPayments||0, sub:'Chase required', color:(stats.pendingPayments||0)>0?'#c04040':'#6aaa48' },
          ].map(s=>(
            <div key={s.label} style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, padding:'16px 18px' }}>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, color:'#3a4a34', letterSpacing:1, marginBottom:6 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:30, color:s.color, letterSpacing:1, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:10, color:'#3a4a34', marginTop:4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:16, alignItems:'start' }}>
          <div>
            {/* Waiver queue */}
            {pending.length>0&&(
              <div style={{ background:'#0d1209', border:'0.5px solid rgba(200,160,48,0.3)', borderRadius:6, marginBottom:16, overflow:'hidden' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', borderBottom:'0.5px solid #1e2a1a', background:'rgba(200,160,48,0.04)' }}>
                  <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, color:'#c8a030', letterSpacing:2 }}>⚠ WAIVER QUEUE</span>
                  <Link href="/admin/waivers" style={{ fontSize:9, color:'#c8a030', textDecoration:'none', fontFamily:'"JetBrains Mono",monospace' }}>VIEW ALL →</Link>
                </div>
                {pending.slice(0,5).map(w=>(
                  <div key={w.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderBottom:'0.5px solid #0f160e', flexWrap:'wrap', gap:8 }}>
                    <div>
                      <span style={{ fontSize:13, color:'#a0b090', fontWeight:500 }}>{w.profiles?.full_name}</span>
                      <span style={{ fontSize:9, color:'#4a5e42', marginLeft:8, fontFamily:'"JetBrains Mono",monospace' }}>{w._type==='edit'?'EDIT':'NEW'}</span>
                      <div style={{ fontSize:10, color:'#3a4a34', marginTop:2 }}>{w.submitted_at?format(new Date(w.submitted_at),'d MMM yyyy · HH:mm'):''}</div>
                    </div>
                    <div style={{ display:'flex', gap:5 }}>
                      <Link href={`/admin/waivers/${w.id}?type=${w._type}`} style={{ fontSize:9, padding:'4px 8px', borderRadius:2, background:'rgba(72,136,200,0.1)', color:'#4888c8', border:'0.5px solid rgba(72,136,200,0.25)', textDecoration:'none' }}>VIEW</Link>
                      <button onClick={()=>handleWaiverAction(w.id,w._type==='edit','approve')} style={{ fontSize:9, padding:'4px 8px', borderRadius:2, background:'rgba(106,170,72,0.1)', color:'#6aaa48', border:'0.5px solid rgba(106,170,72,0.25)', cursor:'pointer' }}>APPROVE</button>
                      <button onClick={()=>handleWaiverAction(w.id,w._type==='edit','reject')}  style={{ fontSize:9, padding:'4px 8px', borderRadius:2, background:'rgba(192,64,64,0.1)',  color:'#c04040', border:'0.5px solid rgba(192,64,64,0.25)',  cursor:'pointer' }}>REJECT</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookings */}
            <div style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, overflow:'hidden' }}>
              <div style={{ padding:'11px 16px', borderBottom:'0.5px solid #1e2a1a' }}>
                <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, color:'#4a5e42', letterSpacing:2, marginBottom:8 }}>BOOKINGS — FILTER BY EVENT</div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  <button onClick={()=>setFilter('all')} style={{ fontSize:9, padding:'3px 9px', borderRadius:2, cursor:'pointer', background:filter==='all'?'rgba(106,170,72,0.1)':'transparent', color:filter==='all'?'#6aaa48':'#4a5e42', border:`0.5px solid ${filter==='all'?'rgba(106,170,72,0.3)':'#1e2a1a'}`, fontFamily:'"JetBrains Mono",monospace' }}>ALL ({bookings.length})</button>
                  {events.filter(e=>new Date(e.event_date)>new Date(Date.now()-86400000*30)).map(e=>{
                    const c=bookings.filter(b=>b.event_id===e.id).length
                    return <button key={e.id} onClick={()=>setFilter(e.id)} style={{ fontSize:9, padding:'3px 9px', borderRadius:2, cursor:'pointer', background:filter===e.id?'rgba(106,170,72,0.1)':'transparent', color:filter===e.id?'#6aaa48':'#4a5e42', border:`0.5px solid ${filter===e.id?'rgba(106,170,72,0.3)':'#1e2a1a'}`, fontFamily:'"JetBrains Mono",monospace' }}>{format(new Date(e.event_date),'d MMM')} ({c})</button>
                  })}
                </div>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
                  <thead><tr>{['PLAYER','EVENT','PKG','PX','PAYMENT','ACTIONS'].map(h=><th key={h} style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, color:'#3a4a34', padding:'8px 12px', textAlign:'left', borderBottom:'0.5px solid #1e2a1a', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.slice(0,50).map(b=>(
                      <tr key={b.id} style={{ borderBottom:'0.5px solid rgba(30,42,26,0.4)' }}>
                        <td style={{ padding:'8px 12px' }}><div style={{ color:'#c0d0b8', fontWeight:500, fontSize:12 }}>{b.profiles?.full_name}</div><div style={{ fontSize:10, color:'#3a4a34' }}>{b.profiles?.email}</div></td>
                        <td style={{ padding:'8px 12px', fontSize:11, color:'#6a7a64' }}><div>{b.events?.title}</div><div style={{ fontSize:10, color:'#3a4a34' }}>{b.events?.event_date?format(new Date(b.events.event_date),'d MMM yyyy'):''}</div></td>
                        <td style={{ padding:'8px 12px', fontSize:11, color:'#6a7a64' }}>{b.package_type==='hire'?'Hire':'Walk-on'}</td>
                        <td style={{ padding:'8px 12px', fontSize:12, color:'#6a7a64', textAlign:'center' }}>{b.player_count}</td>
                        <td style={{ padding:'8px 12px', whiteSpace:'nowrap' }}><span style={{ fontSize:9, padding:'2px 6px', borderRadius:2, background:`${SC[b.status]||'#6a7a64'}18`, color:SC[b.status]||'#6a7a64', border:`0.5px solid ${SC[b.status]||'#6a7a64'}40`, fontFamily:'"JetBrains Mono",monospace' }}>{b.status==='confirmed'?`£${((b.amount_paid||0)/100).toFixed(2)}`:b.status?.toUpperCase()}</span></td>
                        <td style={{ padding:'8px 12px' }}><div style={{ display:'flex', gap:3 }}>
                          <button onClick={()=>handleResend(b.id)} style={{ fontSize:9, padding:'2px 6px', borderRadius:2, background:'rgba(72,136,200,0.1)', color:'#4888c8', border:'0.5px solid rgba(72,136,200,0.25)', cursor:'pointer' }}>✉</button>
                          <Link href={`/admin/bookings/${b.id}`} style={{ fontSize:9, padding:'2px 6px', borderRadius:2, background:'rgba(200,160,48,0.1)', color:'#c8a030', border:'0.5px solid rgba(200,160,48,0.25)', textDecoration:'none' }}>EDIT</Link>
                          {b.status==='confirmed'&&<button onClick={()=>handleRefund(b.id)} style={{ fontSize:9, padding:'2px 6px', borderRadius:2, background:'rgba(192,64,64,0.1)', color:'#c04040', border:'0.5px solid rgba(192,64,64,0.25)', cursor:'pointer' }}>REF</button>}
                        </div></td>
                      </tr>
                    ))}
                    {filtered.length===0&&<tr><td colSpan={6} style={{ textAlign:'center', color:'#2e3e28', padding:28, fontSize:12 }}>No bookings yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {stats&&<div style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, padding:16 }}>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, color:'#3a4a34', letterSpacing:2, marginBottom:12 }}>REVENUE BY PACKAGE</div>
              {[['Walk-on',stats.walkonPct??65],['Hire',stats.hirePct??35]].map(([l,p])=>(
                <div key={l} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6a7a64', marginBottom:4 }}><span>{l}</span><span style={{ color:'#6aaa48', fontWeight:600 }}>{p}%</span></div>
                  <div style={{ height:4, background:'#1e2a1a', borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:`${p}%`, background:'#5a8c3a', borderRadius:2 }}/></div>
                </div>
              ))}
            </div>}

            <div style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, color:'#3a4a34', letterSpacing:2 }}>UPCOMING EVENTS</div>
                <Link href="/admin/events" style={{ fontSize:9, color:'#6aaa48', textDecoration:'none', fontFamily:'"JetBrains Mono",monospace' }}>MANAGE →</Link>
              </div>
              {events.filter(e=>new Date(e.event_date)>=new Date()).slice(0,5).map(e=>{
                const booked=bookings.filter(b=>b.event_id===e.id).length
                const pct=Math.round((booked/e.capacity)*100)
                return <div key={e.id} style={{ marginBottom:10, paddingBottom:10, borderBottom:'0.5px solid #1a2218' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}><span style={{ fontSize:12, color:'#a0b090', fontWeight:500 }}>{e.title}</span><span style={{ fontSize:10, color:'#4a5e42' }}>{booked}/{e.capacity}</span></div>
                  <div style={{ fontSize:10, color:'#3a4a34', marginBottom:4 }}>{format(new Date(e.event_date),'EEE d MMM yyyy')}</div>
                  <div style={{ height:3, background:'#1e2a1a', borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:`${pct}%`, background:pct>=90?'#c04040':pct>=70?'#c8a030':'#5a8c3a', borderRadius:2 }}/></div>
                </div>
              })}
              {events.filter(e=>new Date(e.event_date)>=new Date()).length===0&&<p style={{ fontSize:11, color:'#2e3e28' }}>No upcoming events.</p>}
              <Link href="/admin/events" style={{ display:'block', textAlign:'center', padding:'9px', background:'#5a8c3a', color:'#fff', textDecoration:'none', borderRadius:4, fontSize:11, fontWeight:600, marginTop:4 }}>+ CREATE NEW EVENT</Link>
            </div>

            <div style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, padding:16 }}>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, color:'#3a4a34', letterSpacing:2, marginBottom:12 }}>BOOKING STATUS</div>
              {[['Confirmed',bookings.filter(b=>b.status==='confirmed').length,'#6aaa48'],['Pending',bookings.filter(b=>b.status==='pending').length,'#c8a030'],['Refunded',bookings.filter(b=>b.status==='refunded').length,'#4888c8'],['Cancelled',bookings.filter(b=>b.status==='cancelled').length,'#c04040']].map(([l,c,col])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid #1a2218', fontSize:12 }}>
                  <span style={{ color:'#6a7a64' }}>{l}</span><span style={{ color:col, fontWeight:600, fontFamily:'"JetBrains Mono",monospace' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
