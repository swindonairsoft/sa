// pages/index.js
import Layout from '../components/Layout'
import EventCard from '../components/EventCard'
import Link from 'next/link'
import { getUpcomingEvents, getEventBookingCount } from '../lib/events'

export default function Home({ session, events = [] }) {
  return (
    <Layout session={session} title="Swindon Airsoft" description="Book outdoor and CQB airsoft events in Swindon, Wiltshire. Walk-on and hire packages available.">

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', background: '#080c07' }}>

        {/* Background layers — all absolutely positioned behind content */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, #0a1808 0%, #121e08 35%, #0e1a0a 65%, #080c07 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'repeating-linear-gradient(45deg, rgba(40,60,25,0.06) 0px, rgba(40,60,25,0.06) 2px, transparent 2px, transparent 12px), repeating-linear-gradient(-45deg, rgba(20,35,12,0.04) 0px, rgba(20,35,12,0.04) 2px, transparent 2px, transparent 18px)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top, rgba(8,12,7,0.85) 0%, rgba(8,12,7,0.4) 60%, rgba(8,12,7,0.15) 100%)' }} />

        {/* Decorative crosshair — behind text */}
        <div style={{ position: 'absolute', right: '3%', top: '10%', opacity: 0.05, zIndex: 1, pointerEvents: 'none' }}>
          <svg width="380" height="380" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="190" stroke="#6aaa48" strokeWidth="1"/>
            <circle cx="200" cy="200" r="100" stroke="#6aaa48" strokeWidth="0.5" strokeDasharray="4 4"/>
            <circle cx="200" cy="200" r="30" stroke="#6aaa48" strokeWidth="1"/>
            <line x1="200" y1="0" x2="200" y2="75" stroke="#6aaa48" strokeWidth="2"/>
            <line x1="200" y1="325" x2="200" y2="400" stroke="#6aaa48" strokeWidth="2"/>
            <line x1="0" y1="200" x2="75" y2="200" stroke="#6aaa48" strokeWidth="2"/>
            <line x1="325" y1="200" x2="400" y2="200" stroke="#6aaa48" strokeWidth="2"/>
          </svg>
        </div>

        {/* All content — on top with explicit z-index */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
          <div className="max-w-6xl mx-auto px-4 pb-16 pt-32">
            <div style={{ maxWidth: 640 }}>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(106,170,72,0.12)', border: '1px solid rgba(106,170,72,0.3)',
                color: '#8aaa68', fontSize: 11, letterSpacing: 2, padding: '6px 14px',
                borderRadius: 3, marginBottom: 24,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6aaa48', display: 'inline-block', boxShadow: '0 0 6px #6aaa48' }} />
                UKARA REGISTERED · SWINDON, WILTSHIRE
              </div>

              {/* Main headline */}
              <h1 style={{
                fontFamily: '"Bebas Neue", "Arial Black", sans-serif',
                fontSize: 'clamp(56px, 9vw, 96px)',
                letterSpacing: 4,
                color: '#ffffff',
                lineHeight: 0.92,
                marginBottom: 20,
                textShadow: '0 2px 20px rgba(0,0,0,0.8)',
              }}>
                REAL<br />
                <span style={{ color: '#6aaa48', WebkitTextStroke: '0px' }}>TACTICAL.</span><br />
                REAL AIRSOFT.
              </h1>

              {/* Subheading */}
              <p style={{
                fontSize: 16,
                color: '#8a9e82',
                lineHeight: 1.7,
                marginBottom: 32,
                maxWidth: 500,
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
              }}>
                Outdoor woodland ops, CQB skirmishes &amp; mil-sim events in Swindon.
                Walk-on or full hire — <strong style={{ color: '#aacf90' }}>unlimited BBs included</strong>.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/events" style={{
                  textDecoration: 'none',
                  background: '#5a8c3a',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '13px 28px',
                  borderRadius: 4,
                  letterSpacing: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 20px rgba(90,140,58,0.4)',
                  transition: 'background 0.2s',
                }}>
                  ▶ BOOK YOUR SLOT
                </Link>
                <Link href="/pricing" style={{
                  textDecoration: 'none',
                  background: 'transparent',
                  color: '#8aaa68',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '13px 28px',
                  borderRadius: 4,
                  letterSpacing: 1,
                  border: '1px solid rgba(106,170,72,0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  VIEW PRICING
                </Link>
              </div>
            </div>

            {/* Stats bar */}
            <div style={{
              display: 'flex',
              marginTop: 48,
              flexWrap: 'wrap',
              border: '1px solid rgba(106,170,72,0.15)',
              borderRadius: 6,
              overflow: 'hidden',
              background: 'rgba(10,16,8,0.85)',
              backdropFilter: 'blur(8px)',
              maxWidth: 700,
            }}>
              {[
                { label: 'Players registered', value: '500+' },
                { label: 'Events per year',    value: '50+'  },
                { label: 'Hire packages',      value: 'Unlimited BBs' },
                { label: 'UKARA on-site',      value: 'Registered'    },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: '1 1 130px', padding: '14px 20px',
                  borderRight: i < 3 ? '1px solid rgba(106,170,72,0.1)' : 'none',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#6aaa48', letterSpacing: 1, marginBottom: 2 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#4a5a42', letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section style={{ padding: '64px 0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 3, marginBottom: 6 }}>WHAT'S ON</div>
              <h2 style={{ fontFamily: '"Bebas Neue", "Arial Black", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 2 }}>UPCOMING EVENTS</h2>
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
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6 }}>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 24, color: '#2e3e28', letterSpacing: 2, marginBottom: 8 }}>NO EVENTS SCHEDULED YET</div>
              <p style={{ fontSize: 13, color: '#3a4a34' }}>Check back soon — events are added regularly.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '64px 0', background: '#0a0e09' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 3, marginBottom: 6 }}>GETTING STARTED</div>
            <h2 style={{ fontFamily: '"Bebas Neue", "Arial Black", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 2 }}>HOW IT WORKS</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Create Account', desc: 'Register your player profile with your personal details.' },
              { num: '02', title: 'Sign Waiver',    desc: 'Complete your liability waiver online — required before booking.' },
              { num: '03', title: 'Book Event',     desc: 'Choose your event, package and pay securely via Stripe.' },
              { num: '04', title: 'Show Up & Play', desc: 'Receive your ticket by email. Show up and have a great game.' },
            ].map(step => (
              <div key={step.num} className="tac-card" style={{ padding: '22px' }}>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 42, color: 'rgba(106,170,72,0.18)', lineHeight: 1, marginBottom: 10 }}>{step.num}</div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#aacf90', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section style={{ padding: '64px 0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 3, marginBottom: 6 }}>WHAT'S INCLUDED</div>
            <h2 style={{ fontFamily: '"Bebas Neue", "Arial Black", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 2 }}>CHOOSE YOUR PACKAGE</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                tier: 'WALK-ON', price: 'From £35', sub: 'Own kit · per session',
                features: ['Full day game access', 'Safety brief included', 'Chrono check on arrival', 'Parking included', 'UKARA validation on site'],
                featured: false,
              },
              {
                tier: 'HIRE PACKAGE', price: 'From £55', sub: 'Full rental · per session',
                features: ['RIF + UNLIMITED BBs', 'Full face protection', 'Combat fatigues supplied', 'Everything in Walk-on', 'No experience needed'],
                featured: true,
              },
            ].map(p => (
              <div key={p.tier} className="tac-card" style={{
                padding: 28,
                borderColor: p.featured ? 'rgba(106,170,72,0.4)' : undefined,
                background: p.featured ? 'rgba(106,170,72,0.03)' : undefined,
              }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 6 }}>{p.tier}</div>
                <div style={{ fontFamily: '"Bebas Neue", "Arial Black", sans-serif', fontSize: 32, color: '#e0e8d8', letterSpacing: 1 }}>{p.price}</div>
                <div style={{ fontSize: 11, color: '#3a4a34', marginBottom: 18 }}>{p.sub}</div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 22 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '0.5px solid #1e2a1a', fontSize: 13, color: '#6a7a64', alignItems: 'center' }}>
                      <span style={{ color: '#6aaa48' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  background: p.featured ? '#5a8c3a' : 'transparent',
                  color: p.featured ? '#fff' : '#6aaa48',
                  border: p.featured ? 'none' : '1px solid rgba(106,170,72,0.35)',
                  padding: '11px', borderRadius: 4, fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
                }}>
                  SEE FULL PRICING →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '64px 0', background: '#0a0e09' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 style={{ fontFamily: '"Bebas Neue", "Arial Black", sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', color: '#e0e8d8', letterSpacing: 2, marginBottom: 12 }}>
            READY TO GET IN THE FIELD?
          </h2>
          <p style={{ fontSize: 14, color: '#4a5e42', marginBottom: 28, lineHeight: 1.6 }}>
            Register your account, sign your waiver, and book your first game day today.
          </p>
          <Link href="/auth/register" style={{
            display: 'inline-block', textDecoration: 'none',
            background: '#5a8c3a', color: '#fff',
            fontSize: 13, fontWeight: 700, padding: '14px 36px',
            borderRadius: 4, letterSpacing: 1,
            boxShadow: '0 4px 20px rgba(90,140,58,0.3)',
          }}>
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
