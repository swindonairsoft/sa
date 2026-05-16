// components/AdminLayout.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Navbar from './Navbar'
import { apiFetch } from '@/lib/apiFetch'

export default function AdminLayout({ session, title, children }) {
  const router = useRouter()
  const [counts,    setCounts]    = useState({ waivers:0, profileEdits:0, ukara:0, orders:0 })
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!session) return
    const fetchBadges = () => apiFetch('/api/admin/badges').then(r=>r.json()).then(d=>setCounts(d)).catch(()=>{})
    fetchBadges()
    const iv = setInterval(fetchBadges, 30000)
    return () => clearInterval(iv)
  }, [session])

  const navItems = [
    { href:'/admin',               label:'Dashboard',     icon:'📊', badge:0 },
    { href:'/admin/events',        label:'Events',        icon:'📅', badge:0 },
    { href:'/admin/players',       label:'Players',       icon:'👥', badge:0 },
    { href:'/admin/waivers',       label:'Waivers',       icon:'📋', badge:counts.waivers },
    { href:'/admin/profile-edits', label:'Profile Edits', icon:'✏️',  badge:counts.profileEdits },
    { href:'/admin/ukara',         label:'UKARA',         icon:'🎫', badge:counts.ukara },
    { href:'/admin/shop',          label:'Shop',          icon:'🛒', badge:counts.orders },
  ]

  const isActive = (href) => href==='/admin' ? router.pathname==='/admin' : router.pathname.startsWith(href)

  return (
    <>
      <Head>
        <title>{title ? `${title} — Admin` : 'Admin — Swindon Airsoft'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight:'100vh', background:'#080c07', display:'flex', flexDirection:'column' }}>
        <Navbar session={session} />
        <div style={{ display:'flex', flex:1, paddingTop:64 }}>
          {/* Sidebar */}
          <aside style={{ width:collapsed?52:210, flexShrink:0, background:'#060908', borderRight:'0.5px solid #1e2a1a', position:'sticky', top:64, height:'calc(100vh - 64px)', overflowY:'auto', overflowX:'hidden', transition:'width 0.2s ease', zIndex:10, display:'flex', flexDirection:'column' }}>
            <button onClick={()=>setCollapsed(c=>!c)} style={{ padding:'11px', background:'transparent', border:'none', borderBottom:'0.5px solid #1e2a1a', color:'#3a4a34', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-end', fontSize:18, flexShrink:0 }}>
              {collapsed ? '›' : '‹'}
            </button>
            <nav style={{ padding:'6px 0', flex:1 }}>
              {navItems.map(item => {
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href} title={collapsed?item.label:undefined}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:collapsed?'12px 0':'10px 14px', justifyContent:collapsed?'center':'flex-start', textDecoration:'none', background:active?'rgba(106,170,72,0.08)':'transparent', borderLeft:`2px solid ${active?'#6aaa48':'transparent'}`, marginBottom:1, transition:'background 0.15s', position:'relative' }}>
                    <span style={{ fontSize:17, flexShrink:0, lineHeight:1 }}>{item.icon}</span>
                    {!collapsed && <span style={{ fontSize:12, color:active?'#6aaa48':'#5a6a54', fontWeight:active?600:400, flex:1, whiteSpace:'nowrap', overflow:'hidden' }}>{item.label}</span>}
                    {item.badge>0 && (
                      <span style={{ position:collapsed?'absolute':'static', top:collapsed?5:'auto', right:collapsed?5:'auto', minWidth:17, height:17, background:'#c04040', color:'#fff', fontSize:9, fontWeight:700, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', lineHeight:1, flexShrink:0 }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
            <div style={{ borderTop:'0.5px solid #1e2a1a', padding:collapsed?'10px 0':'10px 14px', flexShrink:0 }}>
              <Link href="/" style={{ fontSize:10, color:'#2e3e28', textDecoration:'none', display:'flex', alignItems:'center', gap:6, justifyContent:collapsed?'center':'flex-start', fontFamily:'"JetBrains Mono",monospace', letterSpacing:1 }}>
                <span style={{ fontSize:14 }}>←</span>
                {!collapsed && <span>VIEW SITE</span>}
              </Link>
            </div>
          </aside>
          {/* Content */}
          <main style={{ flex:1, minWidth:0, overflowX:'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
