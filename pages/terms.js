// pages/terms.js
import Layout from '../components/Layout'
export default function TermsPage({ session }) {
  return (
    <Layout session={session} title="Terms & Conditions">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="section-eyebrow">LEGAL</div>
        <h1 className="section-title" style={{ fontSize: 32, marginBottom: 24 }}>TERMS & CONDITIONS</h1>
        {[
          { title: '1. Bookings', body: 'All bookings are subject to availability. A booking is confirmed only upon receipt of full payment. We reserve the right to refuse bookings at our discretion.' },
          { title: '2. Waivers', body: 'A signed and approved waiver is required before any player may participate in events. Players under 18 require a signed parent/guardian consent as part of the waiver process.' },
          { title: '3. Cancellations & Refunds', body: 'Cancellations made more than 7 days before an event will receive a full refund. Cancellations within 7 days are non-refundable unless the event is cancelled by us. If we cancel an event, a full refund will be issued within 5 business days.' },
          { title: '4. Age Restrictions', body: 'Players must be 12 years or older to participate. Under-18 players require parent/guardian consent. Players under 18 are strictly prohibited from using any pyrotechnic devices in accordance with the UK Fireworks Regulations 2004.' },
          { title: '5. Conduct', body: 'Players must abide by all site rules at all times. Swindon Airsoft reserves the right to remove any player from the site without refund for breach of site rules, threatening behaviour, or any conduct deemed unsafe or inappropriate.' },
          { title: '6. Equipment', body: 'All equipment used on site is subject to chronograph checks. Any equipment found to exceed FPS limits will be prohibited from use. Hire equipment must be returned in the same condition as issued.' },
          { title: '7. Liability', body: 'Participation in airsoft activities is at your own risk. Swindon Airsoft accepts no liability for injury, loss or damage arising from participation, except where caused by our gross negligence.' },
          { title: '8. Photography', body: 'By attending our events, you consent to being photographed for promotional purposes unless you have specifically opted out.' },
          { title: '9. Governing Law', body: 'These terms are governed by the laws of England and Wales.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#aacf90', marginBottom: 6 }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: '#4a5e42', lineHeight: 1.7 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
