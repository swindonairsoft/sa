// pages/profile/waiver.js
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/apiFetch'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
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
    text: 'I agree to wear full-seal eye protection at all times whilst on the active playing field — no exceptions. I understand this rule has no exceptions and that I will be immediately removed from play if found without eye protection.',
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
    text: 'I confirm that I am in good physical health. I agree to disclose any medical conditions, disabilities, or medications that may be relevant to my safe participation in airsoft activities. Please use the box below to declare any relevant medical information (e.g. asthma, heart conditions, epilepsy, allergies). Write "None" if not applicable.',
    required: true,
    hasTextbox: true,
    textboxLabel: 'Medical conditions, disabilities or medications (write "None" if not applicable)',
    textboxPlaceholder: 'e.g. Asthma — carry inhaler at all times. No other conditions.',
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
    text: 'I consent to photographs and video footage being taken during events for use on the Swindon Airsoft website and social media channels. I understand I may request to be excluded from published media by contacting us.',
    required: false,
  },
  {
    id: 'pyro',
    title: 'Pyrotechnics Use (18+ Only)',
    text: 'I understand that pyrotechnic devices (smoke grenades, thunder flashes, pyro grenades) are governed by UK Fireworks Regulations 2004. I confirm I am 18 years of age or older and agree to use all pyrotechnic devices only as directed by a marshal. UNDER 18s ARE STRICTLY PROHIBITED from handling or using any pyrotechnic devices.',
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
  const [checked, setChecked]         = useState({})
  const [textValues, setTextValues]   = useState({})
  const [isUnder18, setIsUnder18]     = useState(false)
  const [parentData, setParentData]   = useState({ parentName: '', parentEmail: '', parentPhone: '', parentSignature: '' })
  const [dob, setDob]                 = useState('')
  const [esign, setEsign]             = useState('')
  const [esignDate, setEsignDate]     = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [error, setError]             = useState('')
  const [existing, setExisting]       = useState(null)

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    setEsignDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    apiFetch('/api/waiver/get')
      .then(r => r.json())
      .then(data => {
        if (data.waiver) {
          setExisting(data.waiver)
          setChecked(data.waiver.sections_agreed || {})
          setTextValues(data.waiver.text_values || {})
          setDob(data.waiver.date_of_birth || '')
          setIsUnder18(data.waiver.is_under18 || false)
        }
      })
  }, [session])

  useEffect(() => {
    if (!dob) return
    const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000))
    const under = age < 18
    setIsUnder18(under)
    if (under) setChecked(prev => ({ ...prev, pyro: false }))
  }, [dob])

  const toggle = (id) => {
    if (id === 'pyro' && isUnder18) return
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const allRequiredChecked = WAIVER_SECTIONS
    .filter(s => s.required && !(s.ageRestricted && isUnder18))
    .every(s => checked[s.id])

  // Medical must have text
  const medicalFilled = (textValues['medical'] || '').trim().length >= 3

  const u18Complete = !isUnder18 || (
    parentData.parentName && parentData.parentEmail && parentData.parentSignature
  )

  // E-sign must match their name (case insensitive)
  const profileName = session?.user?.user_metadata?.full_name || ''
  const esignValid = esign.trim().length >= 3

  const canSubmit = allRequiredChecked && medicalFilled && u18Complete && esignValid

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true); setError('')
    try {
      const res = await apiFetch('/api/waiver/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections_agreed: checked,
          text_values: textValues,
          date_of_birth: dob,
          is_under18: isUnder18,
          parent_data: isUnder18 ? parentData : null,
          esign_name: esign,
          esign_date: esignDate,
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
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 40, color: '#6aaa48', letterSpacing: 2, marginBottom: 8 }}>WAIVER SUBMITTED ✓</div>
        <p style={{ color: '#6a7a64', fontSize: 14, marginBottom: 8 }}>
          {existing ? 'Your waiver update has been submitted for admin review.' : 'Your waiver has been signed and approved — you can now book events!'}
        </p>
        <p style={{ color: '#4a5e42', fontSize: 12, marginBottom: 24 }}>
          {existing ? 'Changes to existing waivers require admin approval before taking effect. You will receive an email once reviewed.' : 'Head to Events to book your first game day.'}
        </p>
        <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>BACK TO PROFILE</Link>
      </div>
    </Layout>
  )

  return (
    <Layout session={session} title="Player Waiver">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div style={{ marginBottom: 28 }}>
          <div className="section-eyebrow">PLAYER DOCUMENTS</div>
          <h1 className="section-title" style={{ fontSize: 28 }}>LIABILITY WAIVER & CONSENT</h1>
          <p style={{ fontSize: 12, color: '#4a5e42', marginTop: 6, lineHeight: 1.6 }}>
            This waiver must be completed and approved before booking any events.
            Read each section carefully and tick to confirm your agreement.
            {existing && <span style={{ color: '#c8a030' }}> Any changes require admin approval before taking effect.</span>}
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
              CURRENT STATUS: {existing.status?.toUpperCase().replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* Date of Birth */}
        <div className="tac-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>PERSONAL DETAILS</h3>
          <div style={{ maxWidth: 260 }}>
            <label className="field-label">DATE OF BIRTH <span style={{ color: '#c04040' }}>*</span></label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="field-input" />
            <p style={{ fontSize: 11, color: '#3a4a34', marginTop: 6 }}>Used to determine age-restricted activities. Under-18 players require parent/guardian consent.</p>
          </div>
        </div>

        {/* U18 PARENT CONSENT — only shown if under 18 */}
        {isUnder18 && (
          <div style={{ background: 'rgba(200,160,48,0.06)', border: '0.5px solid rgba(200,160,48,0.4)', borderRadius: 6, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: '#c8a030', letterSpacing: 2, marginBottom: 6 }}>
              ⚠ UNDER 18 — PARENT / GUARDIAN CONSENT REQUIRED
            </h3>
            <p style={{ fontSize: 12, color: '#a08030', marginBottom: 16, lineHeight: 1.6 }}>
              A parent or legal guardian must complete this section and provide their details as consent for this player to participate.
              <br /><strong style={{ color: '#c8a030' }}>Note: Pyrotechnic devices are strictly prohibited for under-18 players under UK Fireworks Regulations 2004.</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'parentName',      label: 'Parent / Guardian Full Name', type: 'text'  },
                { key: 'parentEmail',     label: 'Parent / Guardian Email',     type: 'email' },
                { key: 'parentPhone',     label: 'Parent / Guardian Phone',     type: 'tel'   },
              ].map(f => (
                <div key={f.key}>
                  <label className="field-label">{f.label} <span style={{ color: '#c04040' }}>*</span></label>
                  <input type={f.type} value={parentData[f.key]} onChange={e => setParentData(p => ({ ...p, [f.key]: e.target.value }))} className="field-input" />
                </div>
              ))}
              <div>
                <label className="field-label">Parent / Guardian Electronic Signature <span style={{ color: '#c04040' }}>*</span></label>
                <input type="text" value={parentData.parentSignature} onChange={e => setParentData(p => ({ ...p, parentSignature: e.target.value }))} className="field-input" placeholder="Type full name as legal signature" />
              </div>
            </div>
          </div>
        )}

        {/* Waiver sections */}
        <div className="tac-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 4 }}>WAIVER AGREEMENTS</h3>
          <p style={{ fontSize: 11, color: '#3a4a34', marginBottom: 16 }}>Read each section carefully. Tick the checkbox to confirm your agreement.</p>

          {WAIVER_SECTIONS.map((section, idx) => {
            const isBlocked = section.ageRestricted && isUnder18
            const isChecked = checked[section.id] || false
            return (
              <div key={section.id} style={{ padding: '16px 0', borderBottom: idx < WAIVER_SECTIONS.length - 1 ? '0.5px solid #1e2a1a' : 'none', opacity: isBlocked ? 0.35 : 1 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id={`w-${section.id}`}
                    checked={isChecked}
                    onChange={() => toggle(section.id)}
                    disabled={isBlocked}
                    style={{ width: 17, height: 17, accentColor: '#6aaa48', flexShrink: 0, marginTop: 3, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`w-${section.id}`} style={{ cursor: isBlocked ? 'not-allowed' : 'pointer' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#c0d0b8' }}>{section.title}</span>
                        {section.required && !isBlocked && <span style={{ fontSize: 9, color: '#c04040', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>REQUIRED</span>}
                        {section.ageRestricted && (
                          <span style={{ fontSize: 9, background: isBlocked ? 'rgba(192,64,64,0.1)' : 'rgba(200,160,48,0.1)', color: isBlocked ? '#c04040' : '#c8a030', padding: '1px 6px', borderRadius: 2, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>
                            {isBlocked ? '18+ ONLY — BLOCKED FOR U18' : '18+ ONLY'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.7, margin: 0 }}>{section.text}</p>
                    </label>

                    {/* Medical textbox */}
                    {section.hasTextbox && (
                      <div style={{ marginTop: 12 }}>
                        <label className="field-label">{section.textboxLabel} <span style={{ color: '#c04040' }}>*</span></label>
                        <textarea
                          rows={3}
                          value={textValues[section.id] || ''}
                          onChange={e => setTextValues(p => ({ ...p, [section.id]: e.target.value }))}
                          className="field-input"
                          placeholder={section.textboxPlaceholder}
                          style={{ resize: 'vertical', minHeight: 80 }}
                        />
                        {checked['medical'] && (textValues['medical'] || '').trim().length < 3 && (
                          <p style={{ fontSize: 11, color: '#c04040', marginTop: 4 }}>Please complete this field (write "None" if not applicable).</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* E-SIGN PANEL */}
        <div className="tac-card" style={{ padding: 20, marginBottom: 16, borderColor: esignValid ? 'rgba(106,170,72,0.3)' : undefined }}>
          <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, color: '#e0e8d8', letterSpacing: 2, marginBottom: 4 }}>ELECTRONIC SIGNATURE</h3>
          <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.6, marginBottom: 16 }}>
            By typing your full name below, you are applying your electronic signature to this waiver. This has the same legal standing as a handwritten signature under the Electronic Communications Act 2000.
          </p>

          <div style={{ background: '#080c07', border: '0.5px solid #1e2a1a', borderRadius: 4, padding: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: '#3a4a34', lineHeight: 1.7, marginBottom: 0 }}>
              I, the undersigned, confirm that I have read, understood and agree to all sections of this waiver (where indicated above). I understand that this is a legally binding document and I sign it freely and voluntarily.
              {isUnder18 && ' The parent/guardian named above provides consent for the player named in this account to participate in Swindon Airsoft events.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">TYPE YOUR FULL NAME (E-SIGNATURE) <span style={{ color: '#c04040' }}>*</span></label>
              <input
                type="text"
                value={esign}
                onChange={e => setEsign(e.target.value)}
                className="field-input"
                placeholder="Type your full name"
                style={{ fontStyle: esign ? 'italic' : 'normal', fontSize: 15, borderColor: esignValid ? 'rgba(106,170,72,0.4)' : undefined }}
              />
              {esign && <p style={{ fontSize: 10, color: esignValid ? '#6aaa48' : '#c04040', marginTop: 4 }}>{esignValid ? '✓ Signature recorded' : 'Please enter your full name'}</p>}
            </div>
            <div>
              <label className="field-label">DATE</label>
              <input type="text" value={esignDate} readOnly className="field-input" style={{ color: '#4a5e42' }} />
            </div>
          </div>

          {esignValid && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(106,170,72,0.05)', border: '0.5px solid rgba(106,170,72,0.2)', borderRadius: 4 }}>
              <p style={{ fontSize: 11, color: '#4a6a3a', margin: 0 }}>
                ✓ Electronic signature applied: <strong style={{ color: '#6aaa48', fontStyle: 'italic' }}>{esign}</strong> — {esignDate}
              </p>
            </div>
          )}
        </div>

        {error && <p style={{ color: '#c04040', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        {!canSubmit && (
          <div style={{ fontSize: 11, color: '#3a4a34', marginBottom: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
            To submit: {!allRequiredChecked && '✗ Tick all required sections · '}{!medicalFilled && '✗ Complete medical disclosure · '}{!esignValid && '✗ Add e-signature · '}{isUnder18 && !u18Complete && '✗ Complete parent/guardian details'}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="btn-primary"
            style={{ opacity: canSubmit ? 1 : 0.5, flex: '1 1 200px', justifyContent: 'center' }}
          >
            {submitting ? 'SUBMITTING…' : existing ? 'SUBMIT UPDATED WAIVER' : '✍ SIGN & SUBMIT WAIVER'}
          </button>
          <Link href="/profile" className="btn-secondary" style={{ textDecoration: 'none', flex: '0 1 auto' }}>CANCEL</Link>
        </div>
      </div>
    </Layout>
  )
}
