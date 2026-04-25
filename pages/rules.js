// pages/rules.js
import Layout from '../components/Layout'

export default function RulesPage({ session }) {
  const sections = [
    {
      title: 'EYE PROTECTION',
      icon: '👁',
      rules: [
        'Full-seal eye protection must be worn at ALL times on the active playing field — no exceptions.',
        'Glasses wearers must use over-goggle protection or prescription-rated full-seal goggles.',
        'Mesh lower face protection is recommended but not mandatory for adults.',
        'Under-18 players must wear full face protection covering eyes, nose and mouth.',
        'Removing eye protection on the field results in immediate removal from play for that session.',
      ],
    },
    {
      title: 'WEAPON RULES & FPS LIMITS',
      icon: '🔫',
      rules: [
        'All RIFs must be chronographed on arrival before entering the field.',
        'AEGs/GBB: maximum 350fps with 0.20g BBs (outdoor), 280fps (indoor/CQB).',
        'Sniper rifles (bolt-action only): maximum 500fps — minimum engagement distance 30m.',
        'HPA/DSG builds must be declared and are subject to additional checks.',
        'Any RIF found exceeding limits will be banned from play for the remainder of the day.',
        'Only biodegradable BBs are permitted on site.',
        'Minimum BB weight: 0.20g. Maximum recommended: 0.28g for standard builds.',
      ],
    },
    {
      title: 'HIT TAKING & FAIR PLAY',
      icon: '🎯',
      rules: [
        'Any hit to your body, clothing, or primary weapon counts as a kill.',
        'Call your hits loudly and clearly — shout "HIT" and raise your hand.',
        'Headshots count. Do not argue your hits.',
        'Ricochet hits do not count.',
        'Bang kills: if you are within 3 metres of an enemy who has not seen you, you may shout "BANG BANG" instead of shooting. They must take the hit.',
        'Blind firing (shooting without looking down sights) is strictly prohibited.',
        'Excessive velocity or full-auto against a player who has already called a hit is not permitted.',
      ],
    },
    {
      title: 'DEAD MAN RULES',
      icon: '💀',
      rules: [
        'When hit, shout "HIT", raise your hand/weapon, and walk calmly to the respawn point.',
        'Dead players may not communicate game information to living players.',
        'Keep your safety kill rag visible whilst walking back to respawn.',
        'Do not interfere with game play whilst dead.',
      ],
    },
    {
      title: 'PYROTECHNICS',
      icon: '💥',
      rules: [
        'Pyrotechnic devices are governed by the UK Fireworks Regulations 2004.',
        'Under 18s are strictly prohibited from handling or using any pyrotechnic devices.',
        'Pyro must only be used as directed by a marshal during gameplay.',
        'Do not throw pyro near faces or directly at players.',
        'Do not throw pyro into confined spaces unless it is designated as a CQB pyro.',
        'Players using pyro irresponsibly will be removed from the site immediately.',
      ],
    },
    {
      title: 'SITE CONDUCT',
      icon: '⚠️',
      rules: [
        'Marshal decisions are final. Arguing with marshals will result in removal from the site.',
        'No alcohol or drugs on site. Anyone found under the influence will be removed immediately.',
        'Treat all other players with respect. Aggressive, threatening or discriminatory behaviour will not be tolerated.',
        'All RIFs must have their magazines removed and be on safe when in the safe zone.',
        'No dry firing in the safe zone.',
        'Keep the site tidy — dispose of spent BBs and litter responsibly.',
        'Swindon Airsoft accepts no responsibility for lost or damaged personal property.',
      ],
    },
    {
      title: 'SAFE ZONE',
      icon: '🟢',
      rules: [
        'The safe zone is a no-shooting area at all times.',
        'All weapons must be pointed in a safe direction in the safe zone.',
        'Eye protection may be removed in the safe zone only.',
        'Chrono checks take place in the safe zone before every game day.',
      ],
    },
  ]

  return (
    <Layout session={session} title="Rules & Safety" description="Site rules and safety information for Swindon Airsoft.">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div style={{ marginBottom: 40 }}>
          <div className="section-eyebrow">IMPORTANT</div>
          <h1 className="section-title" style={{ fontSize: 36 }}>RULES & SAFETY</h1>
          <p style={{ fontSize: 13, color: '#4a5e42', marginTop: 8, maxWidth: 560, lineHeight: 1.7 }}>
            All players must read and understand these rules before attending. By booking an event you confirm you have read and agree to abide by all site rules. Marshal decisions are final.
          </p>
        </div>

        {/* Warning banner */}
        <div style={{ background: 'rgba(192,64,64,0.08)', border: '0.5px solid rgba(192,64,64,0.3)', borderRadius: 6, padding: '14px 18px', marginBottom: 32, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e08080', marginBottom: 4 }}>ZERO TOLERANCE RULES</div>
            <div style={{ fontSize: 12, color: '#8a5050', lineHeight: 1.6 }}>
              Removal of eye protection on the field · Alcohol or drug use on site · Threatening or violent behaviour · Under-18s handling pyrotechnics · Cheating or refusing to take hits
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map(s => (
            <div key={s.title} className="tac-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, color: '#e0e8d8', letterSpacing: 2 }}>{s.title}</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {s.rules.map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < s.rules.length - 1 ? '0.5px solid #1a2218' : 'none', fontSize: 13, color: '#6a7a64', lineHeight: 1.6, alignItems: 'flex-start' }}>
                    <span style={{ color: '#3a5e32', flexShrink: 0, marginTop: 2 }}>—</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, padding: 24, background: '#0a0e09', borderRadius: 6, border: '0.5px solid #1e2a1a' }}>
          <p style={{ fontSize: 13, color: '#4a5e42', marginBottom: 16 }}>Questions about site rules? Get in touch before your first game.</p>
          <a href="/contact" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>CONTACT US →</a>
        </div>
      </div>
    </Layout>
  )
}
