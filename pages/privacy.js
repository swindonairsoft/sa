// pages/privacy.js
import Layout from '../components/Layout'
export default function PrivacyPage({ session }) {
  return (
    <Layout session={session} title="Privacy Policy">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="section-eyebrow">LEGAL</div>
        <h1 className="section-title" style={{ fontSize: 32, marginBottom: 24 }}>PRIVACY POLICY</h1>
        {[
          { title: '1. Who We Are', body: 'Swindon Airsoft operates the website swindonairsoft.com. We are the data controller for personal information collected through this site.' },
          { title: '2. What Data We Collect', body: 'We collect: your name, email address, date of birth, postal address, phone number, booking history, game day attendance records, waiver information, and UKARA application data.' },
          { title: '3. Why We Collect It', body: 'We collect this data to process bookings and payments, manage your player account, process UKARA applications, ensure site safety (including age verification for pyrotechnics), send booking confirmations and tickets, and comply with legal obligations.' },
          { title: '4. Legal Basis', body: 'We process your data under contract performance (bookings), legal obligation (age verification, safety records), and legitimate interests (UKARA processing, site safety). Where we rely on consent, you may withdraw it at any time.' },
          { title: '5. Data Sharing', body: 'We share data with Stripe (payment processing), Resend (email delivery), and Supabase (secure database hosting). We do not sell your data to third parties.' },
          { title: '6. Data Retention', body: 'Booking records are kept for 7 years for accounting purposes. Waiver records are kept for the duration of your registration plus 3 years. You may request deletion of your account at any time.' },
          { title: '7. Your Rights', body: 'Under UK GDPR you have the right to access, correct, delete, or restrict processing of your personal data. Contact us at privacy@swindonairsoft.com to exercise these rights.' },
          { title: '8. Cookies', body: 'We use essential cookies for authentication only. No advertising or tracking cookies are used.' },
          { title: '9. Contact', body: 'For privacy queries: privacy@swindonairsoft.com' },
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
