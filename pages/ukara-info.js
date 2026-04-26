// pages/ukara-info.js
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function UkaraInfoPage({ session }) {
  return (
    <Layout session={session} title="About UKARA">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="section-eyebrow">INFORMATION</div>
        <h1 className="section-title" style={{ fontSize: 32, marginBottom: 8 }}>WHAT IS UKARA?</h1>
        <p style={{ fontSize: 13, color: '#4a5e42', marginBottom: 32, lineHeight: 1.7 }}>
          Everything you need to know about UKARA and why it matters for UK airsoft players.
        </p>
        {[
          { title: 'What is UKARA?', body: 'UKARA (United Kingdom Airsoft Retailers Association) is a registration scheme that allows UK airsoft players to purchase Realistic Imitation Firearms (RIFs) from registered retailers. Without UKARA, retailers can only sell Two-Tone (brightly coloured) replicas.' },
          { title: 'Do I need UKARA to play at Swindon Airsoft?', body: 'No — you do not need UKARA to play at our site. We provide hire equipment and walk-on players can use their own RIFs without UKARA. UKARA is only required when purchasing a RIF from a UK retailer.' },
          { title: 'How do I qualify for UKARA?', body: 'To qualify, you must have attended at least 3 game days at a UKARA-registered site within the last 12 months. Swindon Airsoft is a registered site — every game day you attend with us is automatically logged on your account.' },
          { title: 'How much does it cost?', body: 'The annual UKARA registration fee through Swindon Airsoft is £5.00. This covers our administration costs and is valid for 12 months from the date of approval.' },
          { title: 'How long does the process take?', body: 'Once you have submitted your application and paid the fee, we will review your eligibility and process your application within 5 working days. You will receive your UKARA number by email.' },
          { title: 'What happens when it expires?', body: 'UKARA must be renewed annually. You will need to continue playing regularly to remain eligible. You will receive a reminder email before your UKARA expires.' },
        ].map(item => (
          <div key={item.title} className="tac-card" style={{ padding: 20, marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#aacf90', marginBottom: 8 }}>{item.title}</h3>
            <p style={{ fontSize: 13, color: '#4a5e42', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/profile/ukara" className="btn-primary" style={{ textDecoration: 'none' }}>APPLY FOR UKARA →</Link>
        </div>
      </div>
    </Layout>
  )
}
