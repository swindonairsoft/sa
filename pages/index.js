// pages/index.js
import Layout from '../components/Layout'
import EventCard from '../components/EventCard'
import Link from 'next/link'
import { getUpcomingEvents, getEventBookingCount } from '../lib/events'

export default function Home({ session, events = [] }) {
  return (
    <Layout session={session} title="Swindon Airsoft" description="Book outdoor and CQB airsoft events in Swindon, Wiltshire. Walk-on and hire packages available.">

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          background: '#080c07',
        }}
      >
        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a1808 0%, #121e08 35%, #0e1a0a 65%, #080c07 100%)' }} />
        <div className="camo-bg" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,7,1) 0%, rgba(8,12,7,0.7) 50%, rgba(8,12,7,0.2) 100%)' }} />

        {/* Decorative crosshair */}
        <div style={{ position: 'absolute', right: '5%', top: '15%', opacity: 0.04 }}>
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="190" stroke="#6aaa48" strokeWidth="1"/>
            <circle cx="200" cy="200" r="100" stroke="#6aaa48" strokeWidth="0.5" strokeDasharray="4 4"/>
            <circle cx="200" cy="200" r="30" stroke="#6aaa48" strokeWidth="1"/>
            <line x1="200" y1="0" x2="200" y2="75" stroke="#6aaa48" strokeWidth="2"/>
            <line x1="200" y1="325" x2="200" y2="400" stroke="#6aaa48" strokeWidth="2"/>
            <line x1="0" y1="200" x2="75" y2="200" stroke="#6aaa48" strokeWidth="2"/>
            <line x1="325" y1="200" x2="400" y2="200" stroke="#6aaa48" strokeWidth="2"/>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-16 pt-32 w-full">
          <div className="max-w-2xl">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(106,170,72,0.1)', border: '0.5px solid rgba(106,170,72,0.25)',
              color: '#6aaa48', fontSize: 10, letterSpacing: 2, padding: '5px 12px',
              borderRadius: 2, marginBottom: 20, fontFamily: '"JetBrains Mono", monospace',
            }}>
              <span className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: '#6aaa48', display: 'inline-block' }} />
              UKARA REGISTERED · SWINDON, WILTSHIRE
            </div>

            <h1 style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 'clamp(52px, 8vw, 88px)',
              letterSpacing: 3,
              color: '#e0e8d8',
              lineHeight: 0.95,
              marginBottom: 16,
            }}>
              REAL<br />
              <span style={{ color: '#6aaa48' }}>TACTICAL.</span><br />
              REAL AIRSOFT.
            </h1>

            <p style={{ fontSize: 15, color: '#5a6e52', lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
              Outdoor woodland operations, CQB skirmishes & mil-sim events. Walk-on or full hire — unlimited BBs included.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/events" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, padding: '12px 24px' }}>
                ▶ BOOK YOUR SLOT
              </Link>
              <Link href="/pricing" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 13, padding: '12px 24px' }}>
                VIEW PRICING
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: 0, marginTop: 40, flexWrap: 'wrap',
            border: '0.5px solid #1e2a1a', borderRadius: 6, overflow: 'hidden',
            background: 'rgba(13,18,9,0.8)',
          }}>
            {[
              { label: 'Players registered', value: '500+' },
              { label: 'Events per year', value: '50+' },
              { label: 'Hire packages', value: 'Unlimited BBs' },
              { label: 'UKARA on-site', value: 'Registered' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: '1 1 140px', padding: '14px 20px',
                borderRight: i < 3 ? '0.5px solid #1e2a1a' : 'none',
              }}>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: '#6aaa48', letterSpacing: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#3a4a34', fontFamily: '"JetBrains Mono", monospace', marginTop: 2 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
            <div>
              <div className="section-eyebrow">WHAT'S ON</div>
              <h2 className="section-title">UPCOMING EVENTS</h2>
            </div>
            <Link href="/events" style={{ fontSize: 12, color: '#6aaa48', textDecoration: 'none' }}>Full calendar →</Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.slice(0, 3).map(e => (
                <EventCard key={e.id} event={e} bookingCount={e.booking_count || 0} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#3a4a34' }}>
              <p style={{ fontSize: 14 }}>No upcoming events at the moment — check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '60px 0', background: '#0a0e09' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-eyebrow" style={{ textAlign: 'center' }}>GETTING STARTED</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>HOW IT WORKS</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Create Account', desc: 'Register your player profile with your personal details.' },
              { num: '02', title: 'Sign Waiver', desc: 'Complete your liability waiver online — required before booking.' },
              { num: '03', title: 'Book Event', desc: 'Choose your event, package and pay securely via Stripe.' },
              { num: '04', title: 'Show Up & Play', desc: 'Receive your ticket by email. Show up and have a great game.' },
            ].map(step => (
              <div key={step.num} className="tac-card" style={{ padding: '20px' }}>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, color: 'rgba(106,170,72,0.2)', lineHeight: 1, marginBottom: 10 }}>{step.num}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#aacf90', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="section-eyebrow" style={{ textAlign: 'center' }}>WHAT'S INCLUDED</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>CHOOSE YOUR PACKAGE</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                tier: 'WALK-ON',
                price: 'From £35',
                sub: 'Own kit · per session',
                features: ['Full day game access', 'Safety brief included', 'Chrono check on arrival', 'Parking included', 'UKARA validation on site'],
                featured: false,
              },
              {
                tier: 'HIRE PACKAGE',
                price: 'From £55',
                sub: 'Full rental · per session',
                features: ['RIF + UNLIMITED BBs', 'Full face protection', 'Combat fatigues supplied', 'Everything in Walk-on', 'No prior experience needed'],
                featured: true,
              },
            ].map(p => (
              <div key={p.tier} className="tac-card" style={{
                padding: '24px',
                borderColor: p.featured ? 'rgba(106,170,72,0.4)' : undefined,
                background: p.featured ? 'rgba(106,170,72,0.03)' : undefined,
              }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 6 }}>{p.tier}</div>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#e0e8d8', letterSpacing: 1 }}>{p.price}</div>
                <div style={{ fontSize: 11, color: '#3a4a34', marginBottom: 16 }}>{p.sub}</div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize: 12, color: '#6a7a64', padding: '4px 0', borderBottom: '0.5px solid #1e2a1a', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#6aaa48' }}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  background: p.featured ? '#5a8c3a' : 'transparent',
                  color: p.featured ? '#fff' : '#6aaa48',
                  border: p.featured ? 'none' : '0.5px solid rgba(106,170,72,0.35)',
                  padding: '10px', borderRadius: 4, fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
                }}>
                  SEE FULL PRICING
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '60px 0', background: '#0a0e09' }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#e0e8d8', letterSpacing: 2, marginBottom: 12 }}>
            READY TO GET IN THE FIELD?
          </h2>
          <p style={{ fontSize: 14, color: '#4a5e42', marginBottom: 28 }}>
            Register your account, sign your waiver, and book your first game day today.
          </p>
          <Link href="/auth/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, padding: '13px 32px' }}>
            CREATE YOUR ACCOUNT →
          </Link>
        </div>
      </section>

    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const events = await getUpcomingEvents()
    // Attach booking counts
    const eventsWithCounts = await Promise.all(
      events.slice(0, 6).map(async (e) => ({
        ...e,
        booking_count: await getEventBookingCount(e.id),
      }))
    )
    return { props: { events: eventsWithCounts } }
  } catch (err) {
    console.error('Home page error:', err)
    return { props: { events: [] } }
  }
}
