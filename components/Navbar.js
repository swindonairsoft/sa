// components/Navbar.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { apiFetch } from '@/lib/apiFetch'

const CrosshairIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <circle cx="15" cy="15" r="13" stroke="#6aaa48" strokeWidth="1"/>
    <circle cx="15" cy="15" r="6" stroke="#6aaa48" strokeWidth="0.5" strokeDasharray="2 2"/>
    <circle cx="15" cy="15" r="2" fill="#6aaa48"/>
    <line x1="15" y1="2" x2="15" y2="7" stroke="#6aaa48" strokeWidth="1.5"/>
    <line x1="15" y1="23" x2="15" y2="28" stroke="#6aaa48" strokeWidth="1.5"/>
    <line x1="2" y1="15" x2="7" y2="15" stroke="#6aaa48" strokeWidth="1.5"/>
    <line x1="23" y1="15" x2="28" y2="15" stroke="#6aaa48" strokeWidth="1.5"/>
  </svg>
)

export default function Navbar({ session }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const [isAdmin,   setIsAdmin]   = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check admin status whenever session changes
  useEffect(() => {
    if (!session) { setIsAdmin(false); return }
    apiFetch('/api/admin/verify')
      .then(r => r.json())
      .then(d => setIsAdmin(d.isAdmin || false))
      .catch(() => setIsAdmin(false))
  }, [session])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/events',  label: 'Events'         },
    { href: '/shop',    label: 'Shop'            },
    { href: '/pricing', label: 'Pricing'         },
    { href: '/gallery', label: 'Gallery'         },
    { href: '/rules',   label: 'Rules & Safety'  },
    { href: '/contact', label: 'Contact'         },
  ]

  const activeLink = { color: '#6aaa48' }
  const normalLink = { color: '#6a7a64' }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(8,12,7,0.97)' : '#080c07',
      borderBottom: scrolled ? '0.5px solid #1e2a1a' : '0.5px solid transparent',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <CrosshairIcon />
          <div>
            <div style={{ color: '#e0e8d8', fontFamily: '"Bebas Neue", sans-serif', fontSize: 16, letterSpacing: 2 }}>SWINDON AIRSOFT</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2 }}>TACTICAL COMBAT EXPERIENCE</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden md:flex">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{ ...(router.pathname.startsWith(l.href) ? activeLink : normalLink), fontSize: 12, textDecoration: 'none', fontWeight: 500, letterSpacing: 0.5, transition: 'color 0.2s' }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden md:flex">
          {session ? (
            <>
              {/* Admin button — only shown to admins */}
              {isAdmin && (
                <Link href="/admin" style={{
                  fontSize: 11, padding: '7px 14px', borderRadius: 4,
                  background: 'rgba(200,160,48,0.1)', color: '#c8a030',
                  border: '0.5px solid rgba(200,160,48,0.35)', textDecoration: 'none',
                  fontWeight: 600, letterSpacing: 0.5,
                }}>
                  ⚙ ADMIN
                </Link>
              )}
              <Link href="/profile" style={{
                fontSize: 11, padding: '7px 14px', borderRadius: 4,
                background: 'transparent', color: '#8a9a84',
                border: '0.5px solid #2a3028', textDecoration: 'none',
              }}>
                MY PROFILE
              </Link>
              <button onClick={handleSignOut} style={{
                fontSize: 11, padding: '7px 14px', borderRadius: 4,
                background: 'transparent', color: '#6a4040',
                border: '0.5px solid rgba(192,64,64,0.3)', cursor: 'pointer',
              }}>
                LOG OUT
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{
                fontSize: 11, padding: '7px 14px', borderRadius: 4,
                background: 'transparent', color: '#8a9a84',
                border: '0.5px solid #2a3028', textDecoration: 'none',
              }}>
                LOG IN
              </Link>
              <Link href="/auth/register" style={{
                fontSize: 11, padding: '7px 16px', borderRadius: 4,
                background: '#5a8c3a', color: '#fff',
                border: 'none', textDecoration: 'none', fontWeight: 600,
              }}>
                REGISTER
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5, width: 24 }} className="md:hidden">
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block', height: 1.5, background: '#6aaa48', borderRadius: 1, transition: 'all 0.3s',
              transform: menuOpen ? (i===0 ? 'rotate(45deg) translate(4px,4px)' : i===2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none') : 'none',
              opacity: menuOpen && i===1 ? 0 : 1,
            }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#0a0e09', borderTop: '0.5px solid #1e2a1a', padding: 16 }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', color: '#6a7a64', fontSize: 14, padding: '11px 0', textDecoration: 'none', borderBottom: '0.5px solid #1e2a1a' }}>
              {l.label}
            </Link>
          ))}

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {session ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 4, background: 'rgba(200,160,48,0.1)', color: '#c8a030', border: '0.5px solid rgba(200,160,48,0.3)', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                    ⚙ ADMIN PANEL
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 4, background: 'transparent', color: '#8a9a84', border: '0.5px solid #2a3028', textDecoration: 'none', fontSize: 12 }}>
                  MY PROFILE
                </Link>
                <button onClick={handleSignOut} style={{ width: '100%', padding: '10px', borderRadius: 4, background: 'rgba(192,64,64,0.08)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.3)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  LOG OUT
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 4, background: 'transparent', color: '#8a9a84', border: '0.5px solid #2a3028', textDecoration: 'none', fontSize: 12 }}>LOG IN</Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 4, background: '#5a8c3a', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>REGISTER</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
