// pages/admin/waivers/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { apiFetch } from '@/lib/apiFetch'
import { format } from 'date-fns'

export default function AdminWaiversPage({ session }) {
  const router = useRouter()
  const [waivers,   setWaivers]  = useState({ new:[], edits:[], all:[] })
  const [loading,   setLoading]  = useState(true)
  const [authState, setAuth]     = useState('checking')
  const [msg,       setMsg]      = useState('')
  const [tab,       setTab]      = useState('pending')

  useEffect(() => {
    if (session === undefined) return
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r=>r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setAuth('ok'); load()
    })
  }, [session])

  const load = () => {
    setLoading(true)
    Promise.all([
      apiFetch('/api/admin/waivers/pending').then(r=>r.json()),
      apiFetch('/api/admin/waivers/all').then(r=>r.json()).catch(()=>({ waivers:[] })),
    ]).then(([p,a]) => {
      setWaivers({ new:p.new||[], edits:p.edits||[], all:a.waivers||[] })
      setLoading(false)
    })
  }

  const handleAction = async (id, isEdit, action) => {
    const reason = action==='reject' ? (prompt('Reason (optional):')||'') : ''
    const res = await apiFetch(`/api/admin/waivers/${action}`, { method:'POST', body:JSON.stringify({ id, isEdit, reason }) })
    const d = await res.json()
    if (res.ok) { setMsg(`Waiver ${action}d.`); load() } else setMsg(d.error||'Error')
  }

  const pending = [...waivers.new.map(w=>({...w,_type:'new'})), ...waivers.edits.map(w=>({...w,_type:'edit'}))]
  const SC = { approved:'#6aaa48', pending_approval:'#c8a030', rejected:'#c04040', pending:'#c8a030' }

  if (authState !== 'ok') return (
    <AdminLayout session={session} title="Waivers">
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'#4a5e42', fontFamily:'"JetBrains Mono",monospace', fontSize:11 }}>LOADING…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout session={session} title="Waivers">
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, color:'#6aaa48', letterSpacing:2, marginBottom:4 }}>ADMIN</div>
            <h1 style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:28, color:'#e0e8d8', letterSpacing:2 }}>WAIVERS</h1>
          </div>
          {pending.length>0&&<div style={{ fontSize:11, background:'rgba(200,160,48,0.1)', color:'#c8a030', padding:'5px 12px', borderRadius:3, border:'0.5px solid rgba(200,160,48,0.3)', fontFamily:'"JetBrains Mono",monospace' }}>{pending.length} PENDING</div>}
        </div>

        {msg&&<div style={{ fontSize:12, color:msg.includes('rror')?'#c04040':'#6aaa48', marginBottom:16, padding:'10px 14px', background:'rgba(106,170,72,0.06)', border:'0.5px solid rgba(106,170,72,0.15)', borderRadius:4, display:'flex', justifyContent:'space-between' }}>{msg}<button onClick={()=>setMsg('')} style={{ background:'none', border:'none', color:'#4a5e42', cursor:'pointer' }}>×</button></div>}

        <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'0.5px solid #1e2a1a' }}>
          {[['pending',`Pending (${pending.length})`],['all',`All (${waivers.all.length})`]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'10px 20px', fontSize:11, fontFamily:'"JetBrains Mono",monospace', letterSpacing:1, background:'transparent', color:tab===t?'#6aaa48':'#3a4a34', border:'none', borderBottom:`2px solid ${tab===t?'#6aaa48':'transparent'}`, cursor:'pointer' }}>{l.toUpperCase()}</button>
          ))}
        </div>

        {loading ? <p style={{ color:'#4a5e42', fontSize:12 }}>Loading…</p>

        : tab==='pending' ? (
          pending.length===0 ? (
            <div style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, padding:48, textAlign:'center' }}>
              <div style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:24, color:'#2e3e28', letterSpacing:2, marginBottom:8 }}>ALL CLEAR</div>
              <p style={{ color:'#2e3e28', fontSize:13 }}>No waivers awaiting approval.</p>
            </div>
          ) : (
            <div style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, overflow:'hidden' }}>
              {pending.map((w,i)=>(
                <div key={w.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:i<pending.length-1?'0.5px solid #1a2218':'none', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:13, color:'#c0d0b8', fontWeight:500 }}>{w.profiles?.full_name}</span>
                      <span style={{ fontSize:9, background:w._type==='edit'?'rgba(72,136,200,0.1)':'rgba(106,170,72,0.1)', color:w._type==='edit'?'#4888c8':'#6aaa48', padding:'2px 7px', borderRadius:2, border:`0.5px solid ${w._type==='edit'?'rgba(72,136,200,0.3)':'rgba(106,170,72,0.3)'}`, fontFamily:'"JetBrains Mono",monospace', letterSpacing:1 }}>{w._type==='edit'?'EDIT REQUEST':'NEW WAIVER'}</span>
                      {w.is_under18&&<span style={{ fontSize:9, background:'rgba(200,160,48,0.1)', color:'#c8a030', padding:'2px 7px', borderRadius:2, border:'0.5px solid rgba(200,160,48,0.3)', fontFamily:'"JetBrains Mono",monospace' }}>U18</span>}
                    </div>
                    <div style={{ fontSize:10, color:'#3a4a34' }}>{w.profiles?.email} · {w.submitted_at?format(new Date(w.submitted_at),'d MMM yyyy HH:mm'):'—'}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <Link href={`/admin/waivers/${w.id}?type=${w._type}`} style={{ fontSize:10, padding:'5px 10px', borderRadius:3, background:'rgba(72,136,200,0.1)', color:'#4888c8', border:'0.5px solid rgba(72,136,200,0.25)', textDecoration:'none', fontWeight:600 }}>VIEW</Link>
                    <button onClick={()=>handleAction(w.id,w._type==='edit','approve')} style={{ fontSize:10, padding:'5px 10px', borderRadius:3, background:'rgba(106,170,72,0.1)', color:'#6aaa48', border:'0.5px solid rgba(106,170,72,0.25)', cursor:'pointer', fontWeight:600 }}>APPROVE</button>
                    <button onClick={()=>handleAction(w.id,w._type==='edit','reject')}  style={{ fontSize:10, padding:'5px 10px', borderRadius:3, background:'rgba(192,64,64,0.1)',  color:'#c04040', border:'0.5px solid rgba(192,64,64,0.25)',  cursor:'pointer', fontWeight:600 }}>REJECT</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ background:'#0d1209', border:'0.5px solid #1e2a1a', borderRadius:6, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:560 }}>
                <thead><tr>{['PLAYER','SIGNED','STATUS','U18','E-SIGN','ACTIONS'].map(h=><th key={h} style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9, color:'#3a4a34', padding:'8px 14px', textAlign:'left', borderBottom:'0.5px solid #1e2a1a', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {waivers.all.map(w=>(
                    <tr key={w.id} style={{ borderBottom:'0.5px solid rgba(30,42,26,0.4)' }}>
                      <td style={{ padding:'10px 14px' }}><div style={{ fontSize:12, color:'#c0d0b8', fontWeight:500 }}>{w.profiles?.full_name}</div><div style={{ fontSize:10, color:'#3a4a34' }}>{w.profiles?.email}</div></td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:'#6a7a64', whiteSpace:'nowrap' }}>{w.signed_at?format(new Date(w.signed_at),'d MMM yyyy'):'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:9, padding:'2px 7px', borderRadius:2, background:`${SC[w.status]||'#6a7a64'}18`, color:SC[w.status]||'#6a7a64', border:`0.5px solid ${SC[w.status]||'#6a7a64'}40`, fontFamily:'"JetBrains Mono",monospace' }}>{w.status?.toUpperCase().replace(/_/g,' ')}</span></td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:w.is_under18?'#c8a030':'#3a4a34' }}>{w.is_under18?'⚠ YES':'No'}</td>
                      <td style={{ padding:'10px 14px', fontSize:12, color:'#6aaa48', fontStyle:'italic' }}>{w.esign_name||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><Link href={`/admin/waivers/${w.id}?type=new`} style={{ fontSize:9, padding:'3px 8px', borderRadius:2, background:'rgba(72,136,200,0.1)', color:'#4888c8', border:'0.5px solid rgba(72,136,200,0.25)', textDecoration:'none' }}>VIEW</Link></td>
                    </tr>
                  ))}
                  {waivers.all.length===0&&<tr><td colSpan={6} style={{ textAlign:'center', color:'#2e3e28', padding:32, fontSize:12 }}>No waivers yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
