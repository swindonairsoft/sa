// pages/gallery.js
import Layout from '@/components/Layout'

// Placeholder gallery items — replace image URLs with real site photos
const GALLERY = [
  { id: 1, caption: 'Woodland Operations', type: 'outdoor', gradient: 'linear-gradient(135deg,#0f2210,#1a3a12)' },
  { id: 2, caption: 'CQB Night Raid', type: 'indoor', gradient: 'linear-gradient(135deg,#0d1a2a,#12243a)' },
  { id: 3, caption: 'Mil-Sim Event', type: 'milsim', gradient: 'linear-gradient(135deg,#1a2210,#2a3518)' },
  { id: 4, caption: 'Kit Inspection', type: 'outdoor', gradient: 'linear-gradient(135deg,#0f1e10,#1a2e18)' },
  { id: 5, caption: 'Team Briefing', type: 'outdoor', gradient: 'linear-gradient(135deg,#101a0e,#182616)' },
  { id: 6, caption: 'Urban Assault', type: 'cqb', gradient: 'linear-gradient(135deg,#0d1520,#12202e)' },
  { id: 7, caption: 'Sniper Position', type: 'outdoor', gradient: 'linear-gradient(135deg,#0e1c0e,#162814)' },
  { id: 8, caption: 'Safe Zone Setup', type: 'outdoor', gradient: 'linear-gradient(135deg,#121a0f,#1c2817)' },
  { id: 9, caption: 'Night Game', type: 'indoor', gradient: 'linear-gradient(135deg,#0a0f18,#0f1a28)' },
]

const TYPE_LABELS = { outdoor: 'OUTDOOR', indoor: 'INDOOR', cqb: 'CQB', milsim: 'MIL-SIM' }

export default function GalleryPage({ session }) {
  return (
    <Layout session={session} title="Gallery" description="Photos from Swindon Airsoft events — woodland ops, CQB, mil-sim and more.">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div style={{ marginBottom: 32 }}>
          <div className="section-eyebrow">IN ACTION</div>
          <h1 className="section-title" style={{ fontSize: 36 }}>GALLERY</h1>
          <p style={{ fontSize: 13, color: '#4a5e42', marginTop: 8 }}>Photos from our events. Want to see your shots here? Tag us on social media.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GALLERY.map((item, i) => (
            <div key={item.id} className="tac-card" style={{ overflow: 'hidden', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(106,170,72,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}
            >
              {/* Photo placeholder — replace with <img src={item.url} /> when you have real photos */}
              <div style={{
                height: i % 3 === 0 ? 200 : 160,
                background: item.gradient,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div className="camo-bg" style={{ position: 'absolute', inset: 0 }} />
                {/* Replace this SVG placeholder with a real <img> tag */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.15">
                  <circle cx="20" cy="20" r="18" stroke="#6aaa48" strokeWidth="1"/>
                  <circle cx="20" cy="20" r="2.5" fill="#6aaa48"/>
                  <line x1="20" y1="2" x2="20" y2="9" stroke="#6aaa48" strokeWidth="1.5"/>
                  <line x1="20" y1="31" x2="20" y2="38" stroke="#6aaa48" strokeWidth="1.5"/>
                  <line x1="2" y1="20" x2="9" y2="20" stroke="#6aaa48" strokeWidth="1.5"/>
                  <line x1="31" y1="20" x2="38" y2="20" stroke="#6aaa48" strokeWidth="1.5"/>
                </svg>
                <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 9, background: 'rgba(0,0,0,0.5)', color: '#6aaa48', padding: '2px 7px', borderRadius: 2, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>
                  {TYPE_LABELS[item.type]}
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <p style={{ fontSize: 12, color: '#6a7a64', margin: 0 }}>{item.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, padding: 24, background: '#0a0e09', border: '0.5px solid #1e2a1a', borderRadius: 6 }}>
          <p style={{ fontSize: 13, color: '#4a5e42', marginBottom: 4 }}>📸 Want your photos featured here?</p>
          <p style={{ fontSize: 12, color: '#3a4a34' }}>Send your best shots to photos@swindonairsoft.com or tag us on social media.</p>
        </div>
      </div>
    </Layout>
  )
}
