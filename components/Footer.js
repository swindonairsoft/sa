// components/Footer.js
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#060908', borderTop: '0.5px solid #1e2a1a', marginTop: 'auto' }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: '#6aaa48', letterSpacing: '2px', marginBottom: '8px' }}>
              SWINDON AIRSOFT
            </div>
            <p style={{ fontSize: '12px', color: '#3a4a34', lineHeight: 1.6 }}>
              Swindon, Wiltshire<br />
              UKARA Registered Site<br />
              swindonairsoft.com
            </p>
          </div>

          {/* Play */}
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: '#4a5e42', letterSpacing: '2px', marginBottom: '12px' }}>PLAY</div>
            {[
              { href: '/events', label: 'Events' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/gallery', label: 'Gallery' },
              { href: '/rules', label: 'Rules & Safety' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', color: '#3a4a34', fontSize: '12px', marginBottom: '6px', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: '#4a5e42', letterSpacing: '2px', marginBottom: '12px' }}>ACCOUNT</div>
            {[
              { href: '/auth/register', label: 'Register' },
              { href: '/auth/login', label: 'Log In' },
              { href: '/profile', label: 'My Profile' },
              { href: '/profile/waiver', label: 'My Waiver' },
              { href: '/profile/ukara', label: 'UKARA Application' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', color: '#3a4a34', fontSize: '12px', marginBottom: '6px', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: '#4a5e42', letterSpacing: '2px', marginBottom: '12px' }}>INFO</div>
            {[
              { href: '/contact', label: 'Contact Us' },
              { href: '/rules', label: 'Site Rules' },
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms & Conditions' },
              { href: '/ukara-info', label: 'About UKARA' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', color: '#3a4a34', fontSize: '12px', marginBottom: '6px', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '0.5px solid #1a2218', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: '#1e2a1a', fontSize: '11px' }}>
            © {new Date().getFullYear()} Swindon Airsoft. All rights reserved.
          </p>
          <p style={{ color: '#1e2a1a', fontSize: '10px', fontFamily: '"JetBrains Mono", monospace' }}>
            UKARA REGISTERED · SWINDON, WILTSHIRE
          </p>
        </div>
      </div>
    </footer>
  )
}
