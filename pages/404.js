// pages/404.js
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function NotFoundPage({ session }) {
  return (
    <Layout session={session} title="Page Not Found">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 120, color: 'rgba(106,170,72,0.1)', lineHeight: 1, marginBottom: 0 }}>404</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 2, marginTop: -20, marginBottom: 12 }}>PAGE NOT FOUND</h1>
          <p style={{ fontSize: 13, color: '#4a5e42', marginBottom: 28, lineHeight: 1.6 }}>
            This position has been overrun. The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>← HOME BASE</Link>
            <Link href="/events" className="btn-ghost" style={{ textDecoration: 'none' }}>BROWSE EVENTS</Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
