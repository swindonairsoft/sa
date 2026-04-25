// components/Navbar.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinks = [
    { href: '/events', label: 'Events' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/rules', label: 'Rules & Safety' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8,12,7,0.97)' : '#080c07',
        borderBottom: `0.5px solid ${scrolled ? '#1e2a1a' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <CrosshairIcon />
          <div>
            <div style={{ color: '#e0e8d8', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', letterSpacing: '2px' }}>
              SWINDON AIRSOFT
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: '#4a5e42', letterSpacing: '2px' }}>
              TACTICAL COMBAT EXPERIENCE
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color: router.pathname.startsWith(l.href) ? '#6aaa48' : '#6a7a64',
                fontSize: '12px',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                transition: 'color 0.2s',
                fontWeight: '500',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              <Link href="/profile" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '11px', textDecoration: 'none' }}>
                MY PROFILE
              </Link>
              <Link href="/events" className="btn-primary" style={{ padding: '7px 16px', fontSize: '11px', textDecoration: 'none' }}>
                BOOK NOW
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '11px', textDecoration: 'none' }}>
                LOG IN
              </Link>
              <Link href="/auth/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: '11px', textDecoration: 'none' }}>
                REGISTER
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          aria-label="Toggle menu"
        >
          <div style={{ width: 22, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', height: 1.5, background: '#6aaa48', borderRadius: 1,
                transition: 'all 0.3s',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(4px, 4px)'
                  : i === 2 ? 'rotate(-45deg) translate(4px, -4px)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#0a0e09', borderTop: '0.5px solid #1e2a1a', padding: '16px' }} className="md:hidden">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: '#6a7a64', fontSize: '14px', padding: '10px 0', textDecoration: 'none', borderBottom: '0.5px solid #1e2a1a' }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: '16px', display: 'flex', gap: 8 }}>
            {session ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '12px' }}>MY PROFILE</Link>
                <button onClick={handleSignOut} className="btn-danger" style={{ flex: 1, fontSize: '12px' }}>SIGN OUT</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '12px' }}>LOG IN</Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '12px' }}>REGISTER</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
