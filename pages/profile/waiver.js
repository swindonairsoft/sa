// pages/profile/waiver.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'

const WAIVER_SECTIONS = [
  {
    id: 'liability',
    title: 'Liability & Risk Acceptance',
    text: 'I understand that airsoft involves the use of replica firearms that fire 6mm plastic projectiles, and that participation carries inherent risks of physical injury including but not limited to eye injury, bruising, impact injury, and trips or falls on uneven terrain. I acknowledge these risks and voluntarily accept them.',
    required: true,
  },
  {
    id: 'rules',
    title: 'Site Rules & Marshal Authority',
    text: 'I agree to follow all site rules, game rules, and the instructions of Swindon Airsoft marshals at all times. I understand that failure to comply with rules or marshal instructions may result in immediate removal from the site without refund.',
    required: true,
  },
  {
    id: 'eye_protection',
    title: 'Eye Protection',
    text: 'I agree to wear full-seal eye protection at all times whilst on the active playing field. I understand this rule has no exceptions and that I will be immediately removed from play if found without eye protection.',
    required: true,
  },
  {
    id: 'chronograph',
    title: 'Chronograph & FPS Limits',
    text: 'I agree to have all RIFs (Replica Imitation Firearms) chronographed before play to ensure they comply with Swindon Airsoft FPS limits. I accept that any RIF exceeding limits will be prohibited from play for the duration of the event.',
    required: true,
  },
  {
    id: 'medical',
    title: 'Medical Disclosure',
    text: 'I confirm that I am in good physical health and am not aware of any medical conditions that would put me at increased risk. I agree to inform Swindon Airsoft staff of any relevant medical conditions or medications on arrival at the site briefing.',
    required: true,
  },
  {
    id: 'indemnity',
    title: 'Indemnity & Legal Release',
    text: 'I agree to indemnify and hold harmless Swindon Airsoft, its owners, employees, marshals and volunteers against any claims, demands, damages, costs or liability arising from my participation in events, except in cases of gross negligence on the part of Swindon Airsoft.',
    required: true,
  },
  {
    id: 'photos',
    title: 'Photography & Media',
    text: 'I consent to photographs and video footage being taken during events for use on the Swindon Airsoft website and social media channels. I understand I may request to be excluded from published media.',
    required: false,
  },
  {
    id: 'pyro',
    title: 'Pyrotechnics Use (If Applicable)',
    text: 'I understand that pyrotechnic devices (smoke grenades, thunder flashes, pyro grenades) are governed by UK Firework Regulations 2004. I confirm I am 18 years of age or older and agree to use all pyrotechnic devices only as directed by a marshal. UNDER 18s ARE NOT PERMITTED TO HANDLE OR USE ANY PYROTECHNIC DEVICES.',
    required: false,
    ageRestricted: true,
  },
  {
    id: 'data',
    title: 'Data Protection & Privacy',
    text: 'I consent to Swindon Airsoft storing my personal information (name, address, contact details, booking history) in accordance with their Privacy Policy and UK GDPR. This data is used solely for booking management, UKARA processing and site safety purposes.',
    required: true,
  },
]

export default function WaiverPage({ session }) {
  const router = useRouter()
  const [checked, setChecked]       = useState({})
  const [isUnder18, setIsUnder18]   = useState(false)
  const [parentData, setParentData] = useState({ parentName: '', parentEmail: '', parentPhone: '', parentSignature: '' })
  const [dob, setDob]               = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')
  const [existing, setExisting]     = useState(null)

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    fetch('/api/waiver/get')
      .then(r => r.json())
      .then(data => {
        if (data.waiver) {
          setExisting(data.waiver)
          setChecked(data.waiver.sections_agreed || {})
          setDob(data.waiver.date_of_birth || '')
          setIsUnder18(data.waiver.is_under18 || false)
        }
      })
  }, [session])

  // Auto-detect under 18 from DOB
  useEffect(() => {
    if (!dob) return
    const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000))
    const under = age < 18
    setIsUnder18(under)
    // Clear pyro if under 18
    if (under) setChecked(prev => ({ ...prev, pyro: false }))
  }, [dob])

  const toggle = (id) => {
    if (id === 'pyro' && isUnder18) return // Block pyro for U18
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const allRequiredChecked = WAIVER_SECTIONS
    .filter(s => s.required && !(s.ageRestricted && isUnder18))
    .every(s => checked[s.id])

  const u18Complete = !isUnder18 || (
    parentData.parentName && parentData.parentEmail && parentData.parentSignature
  )

  const canSubmit = allRequiredChecked && u18Complete

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/waiver/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections_agreed: checked,
          date_of_birth: dob,
          is_under18: isUnder18,
          parent_data: isUnder18 ? parentData : null,
          signed_at: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <Layout session={session} title="Waiver Submitted">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 40, color: '#6aaa48', letterSpacing: 2, marginBottom: 8 }}>WAIVER SUBMITTED</div>
        <p style={{ color: '#6a7a64', fontSize: 14, marginBottom: 24 }}>
          Your waiver has been submitted and is pending admin approval. You will receive an email once approved.{' '}
          {existing ? 'Changes to existing waivers require admin review before taking effect.' : ''}
        </p>
        <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>BACK TO PROFILE</Link>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="Player Waiver">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-eyebrow">PLAYER DOCUMENTS</div>
          <h1 className="section-title" style={{ fontSize: 28 }}>LIABILITY WAIVER & CONSENT</h1>
          <p style={{ fontSize: 12, color: '#4a5e42', marginTop: 6 }}>
            This waiver must be completed and approved before booking any events.
            {existing && <span style={{ color: '#c8a030' }}> Any changes to your waiver require admin approval before taking effect.</span>}
          </p>
        </div>

        {/* Status badge */}
        {existing && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: existing.status === 'approved' ? 'rgba(106,170,72,0.1)' : 'rgba(200,160,48,0.1)',
            border: `0.5px solid ${existing.status === 'approved' ? 'rgba(106,170,72,0.3)' : 'rgba(200,160,48,0.3)'}`,
            borderRadius: 4, padding: '8px 14px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 11, color: existing.status === 'approved' ? '#6aaa48' : '#c8a030', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>
              CURRENT STATUS: {existing.status?.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Date of Birth */}
        <div className="tac-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>PERSONAL DETAILS</h3>
          <div>
            <label className="field-label">DATE OF BIRTH <span style={{ color: '#c04040' }}>*</span></label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="field-input"
              style={{ maxWidth: 200 }}
            />
            <p style={{ fontSize: 11, color: '#3a4a34', marginTop: 6 }}>
              Required to determine age-restricted activities. Players under 18 require parent/guardian consent.
            </p>
          </div>
        </div>

        {/* U18 ALERT PANEL */}
        {isUnder18 && (
          <div style={{
            background: 'rgba(200,160,48,0.08)', border: '0.5px solid rgba(200,160,48,0.4)',
            borderRadius: 6, padding: 20, marginBottom: 16,
          }}>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, color: '#c8a030', letterSpacing: 2, marginBottom: 8 }}>
              ⚠ UNDER 18 — PARENT / GUARDIAN CONSENT REQUIRED
            </h3>
            <p style={{ fontSize: 12, color: '#a08030', marginBottom: 16, lineHeight: 1.6 }}>
              As this player is under 18, a parent or legal guardian must provide consent and contact details.
              Pyrotechnic devices are <strong>strictly prohibited</strong> for under-18 players under UK Firework Regulations 2004.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'parentName',  label: 'Parent / Guardian Full Name',  type: 'text'  },
                { key: 'parentEmail', label: 'Parent / Guardian Email',       type: 'email' },
                { key: 'parentPhone', label: 'Parent / Guardian Phone',       type: 'tel'   },
              ].map(f => (
                <div key={f.key}>
                  <label className="field-label">{f.label} <span style={{ color: '#c04040' }}>*</span></label>
                  <input
                    type={f.type}
                    value={parentData[f.key]}
                    onChange={e => setParentData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="field-input"
                    placeholder={f.label}
                  />
                </div>
              ))}
              <div>
                <label className="field-label">Parent / Guardian Signature (Type Full Name) <span style={{ color: '#c04040' }}>*</span></label>
                <input
                  type="text"
                  value={parentData.parentSignature}
                  onChange={e => setParentData(prev => ({ ...prev, parentSignature: e.target.value }))}
                  className="field-input"
                  placeholder="Type full name as signature"
                />
              </div>
            </div>
          </div>
        )}

        {/* Waiver sections */}
        <div className="tac-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 16 }}>
            WAIVER AGREEMENTS — READ EACH SECTION AND TICK TO CONFIRM
          </h3>

          {WAIVER_SECTIONS.map(section => {
            const isBlocked = section.ageRestricted && isUnder18
            const isChecked = checked[section.id] || false

            return (
              <div
                key={section.id}
                style={{
                  padding: '14px 0',
                  borderBottom: '0.5px solid #1e2a1a',
                  opacity: isBlocked ? 0.4 : 1,
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id={`waiver-${section.id}`}
                    checked={isChecked}
                    onChange={() => toggle(section.id)}
                    disabled={isBlocked}
                    style={{ width: 16, height: 16, accentColor: '#6aaa48', flexShrink: 0, marginTop: 2, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                  />
                  <label htmlFor={`waiver-${section.id}`} style={{ cursor: isBlocked ? 'not-allowed' : 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#c0d0b8' }}>{section.title}</span>
                      {section.required && !isBlocked && (
                        <span style={{ fontSize: 9, color: '#c04040', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>REQUIRED</span>
                      )}
                      {section.ageRestricted && (
                        <span style={{ fontSize: 9, color: '#c8a030', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1, background: 'rgba(200,160,48,0.1)', padding: '1px 5px', borderRadius: 2 }}>
                          {isBlocked ? '18+ ONLY — BLOCKED FOR U18' : '18+'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.6 }}>{section.text}</p>
                  </label>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="tac-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#4a5e42', lineHeight: 1.7 }}>
            By submitting this waiver I confirm that all information provided is accurate, that I have read and understood all sections above, and that I am signing this waiver freely and voluntarily.
            {isUnder18 && ' The parent/guardian named above consents to this player\'s participation.'}
          </div>
        </div>

        {error && (
          <p style={{ color: '#c04040', fontSize: 12, marginBottom: 12 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="btn-primary"
            style={{ opacity: canSubmit ? 1 : 0.5, flex: '1 1 200px', justifyContent: 'center' }}
          >
            {submitting ? 'SUBMITTING...' : existing ? 'SUBMIT UPDATED WAIVER' : 'SIGN & SUBMIT WAIVER'}
          </button>
          <Link href="/profile" className="btn-secondary" style={{ textDecoration: 'none', flex: '0 1 auto' }}>
            CANCEL
          </Link>
        </div>

        {!canSubmit && (
          <p style={{ fontSize: 11, color: '#3a4a34', marginTop: 10 }}>
            Please tick all required sections{isUnder18 ? ' and complete parent/guardian details' : ''} before submitting.
          </p>
        )}
      </div>
    </Layout>
  )
}
