// pages/pricing.js
import Layout from '../components/Layout'
import Link from 'next/link'

export default function PricingPage({ session }) {
  return (
    <Layout session={session} title="Pricing" description="Airsoft pricing at Swindon Airsoft — walk-on and hire packages with unlimited BBs.">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-eyebrow" style={{ textAlign: 'center' }}>WHAT IT COSTS</div>
          <h1 className="section-title" style={{ fontSize: 36, textAlign: 'center' }}>PRICING</h1>
          <p style={{ fontSize: 13, color: '#4a5e42', marginTop: 8, maxWidth: 480, margin: '8px auto 0' }}>
            All prices are per player per session. Hire packages include unlimited BBs.
          </p>
        </div>

        {/* Main pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {[
            {
              tier: 'WALK-ON',
              price: '£35',
              sub: 'Own kit · per session',
              desc: 'Bring your own RIF and kit. Perfect for experienced players who have their own equipment.',
              features: [
                'Full day game access',
                'Safety briefing on arrival',
                'Chronograph check included',
                'Free parking on site',
                'UKARA verification available',
                'Access to all game zones',
              ],
              featured: false,
              cta: 'BOOK WALK-ON',
            },
            {
              tier: 'HIRE PACKAGE',
              price: '£55',
              sub: 'Full rental · per session',
              desc: 'Everything you need to play. Great for beginners or players without their own gear.',
              features: [
                'RIF (replica firearm) included',
                'UNLIMITED BBs all day',
                'Full face protection',
                'Combat fatigues supplied',
                'Everything in Walk-on',
                'No prior experience needed',
              ],
              featured: true,
              cta: 'BOOK HIRE PACKAGE',
            },
          ].map(p => (
            <div key={p.tier} className="tac-card" style={{
              padding: 28,
              borderColor: p.featured ? 'rgba(106,170,72,0.4)' : undefined,
              background: p.featured ? 'rgba(106,170,72,0.03)' : undefined,
              position: 'relative',
            }}>
              {p.featured && (
                <div style={{ position: 'absolute', top: -1, right: 20, background: '#5a8c3a', color: '#fff', fontSize: 9, padding: '3px 10px', borderRadius: '0 0 4px 4px', letterSpacing: 1, fontFamily: '"JetBrains Mono", monospace' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#6aaa48', letterSpacing: 2, marginBottom: 8 }}>{p.tier}</div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 48, color: '#e0e8d8', letterSpacing: 2, lineHeight: 1 }}>{p.price}</div>
              <div style={{ fontSize: 12, color: '#3a4a34', marginBottom: 12 }}>{p.sub}</div>
              <p style={{ fontSize: 13, color: '#5a6a54', lineHeight: 1.6, marginBottom: 20 }}>{p.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #1e2a1a', fontSize: 13, color: '#7a8a74', alignItems: 'center' }}>
                    <span style={{ color: '#6aaa48', fontSize: 16, lineHeight: 1 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/events" className={p.featured ? 'btn-primary' : 'btn-ghost'} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '12px', fontSize: 12 }}>
                {p.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 24, color: '#e0e8d8', letterSpacing: 2, marginBottom: 16, textAlign: 'center' }}>OPTIONAL ADD-ONS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { name: 'Pyro Pack', price: '£10', desc: 'Smoke grenades and thunder flashes. 18+ only — UK firework regulations apply.', restriction: '18+ ONLY' },
              { name: 'Extra Ammo Bag', price: '£5', desc: 'Additional BBs for walk-on players. Hire package players already have unlimited BBs.', restriction: 'WALK-ON ONLY' },
            ].map(a => (
              <div key={a.name} className="tac-card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#c0d0b8' }}>{a.name}</span>
                    <span style={{ fontSize: 9, background: 'rgba(200,160,48,0.1)', color: '#c8a030', padding: '1px 6px', borderRadius: 2, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>{a.restriction}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.5 }}>{a.desc}</p>
                </div>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, color: '#6aaa48', letterSpacing: 1, flexShrink: 0 }}>{a.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto">
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 24, color: '#e0e8d8', letterSpacing: 2, marginBottom: 16, textAlign: 'center' }}>COMMON QUESTIONS</h2>
          {[
            { q: 'Do I need to book in advance?', a: 'Yes — all places must be booked online in advance. We cannot guarantee spots on the day without a booking.' },
            { q: 'What age do you need to be?', a: 'Players must be 12 or over. Players under 18 require a parent or guardian to sign a consent form as part of the waiver process.' },
            { q: 'Do I need a UKARA number to book?', a: 'No — you do not need UKARA to play at our site. UKARA is only required when purchasing RIFs from retailers. We can help you apply once you have played 3 game days with us.' },
            { q: 'Can under-18s use pyro?', a: 'No. Pyrotechnic devices are classified as fireworks under UK law and are strictly prohibited for anyone under 18, regardless of supervision.' },
            { q: 'What if an event is cancelled?', a: 'In the unlikely event we cancel, you will receive a full refund to your original payment method within 3–5 business days.' },
          ].map((faq, i) => (
            <div key={i} className="tac-card" style={{ padding: '14px 18px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#aacf90', marginBottom: 6 }}>{faq.q}</div>
              <div style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/events" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, padding: '13px 32px' }}>
            BROWSE EVENTS & BOOK →
          </Link>
        </div>
      </div>
    </Layout>
  )
}
