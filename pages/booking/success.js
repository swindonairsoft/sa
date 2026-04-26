// pages/booking/success.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'

export default function BookingSuccessPage({ session }) {
  const router = useRouter()
  const { ref } = router.query
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ref) return
    fetch(`/api/bookings/by-ref?ref=${ref}`)
      .then(r => r.json())
      .then(d => { setBooking(d.booking); setLoading(false) })
  }, [ref])

  return (
    <Layout session={session} title="Booking Confirmed">
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        {loading ? (
          <p style={{ color: '#4a5e42' }}>Loading…</p>
        ) : (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(106,170,72,0.15)', border: '1px solid rgba(106,170,72,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
              ✓
            </div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, color: '#6aaa48', letterSpacing: 2, marginBottom: 8 }}>
              BOOKING CONFIRMED!
            </h1>
            <p style={{ fontSize: 14, color: '#5a6e52', marginBottom: 28 }}>
              Your ticket has been sent to your email address.
            </p>

            {booking && (
              <div className="tac-card" style={{ padding: 24, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>BOOKING DETAILS</div>
                {[
                  ['Event',       booking.events?.title],
                  ['Date',        booking.events?.event_date ? format(new Date(booking.events.event_date), 'EEEE d MMMM yyyy') : '—'],
                  ['Package',     booking.package_type === 'hire' ? 'Hire Package (unlimited BBs)' : 'Walk-on'],
                  ['Players',     booking.player_count],
                  ['Amount Paid', `£${((booking.amount_paid || 0) / 100).toFixed(2)}`],
                  ['Booking Ref', booking.booking_ref],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #1e2a1a', fontSize: 13 }}>
                    <span style={{ color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }}>{label.toUpperCase()}</span>
                    <span style={{ color: label === 'Booking Ref' ? '#6aaa48' : '#c0d0b8', fontWeight: label === 'Booking Ref' ? 600 : 400 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: 'rgba(106,170,72,0.05)', border: '0.5px solid rgba(106,170,72,0.15)', borderRadius: 6, padding: 16, marginBottom: 24, fontSize: 12, color: '#4a5e42', lineHeight: 1.7 }}>
              Please arrive <strong style={{ color: '#8aab78' }}>15 minutes early</strong> for the safety briefing. Bring your booking reference or show this page. Eye protection required at all times on the field.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>VIEW MY BOOKINGS</Link>
              <Link href="/events" className="btn-ghost" style={{ textDecoration: 'none' }}>BROWSE MORE EVENTS</Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
