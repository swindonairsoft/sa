// pages/contact.js
import { useState } from 'react'
import Layout from '../components/Layout'

export default function ContactPage({ session }) {
  const [form, setForm]   = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]   = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true); setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
    } catch {
      setError('Failed to send message. Please email us directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Layout session={session} title="Contact" description="Get in touch with Swindon Airsoft.">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div style={{ marginBottom: 40 }}>
          <div className="section-eyebrow">GET IN TOUCH</div>
          <h1 className="section-title" style={{ fontSize: 36 }}>CONTACT US</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Info */}
          <div>
            <div className="tac-card" style={{ padding: 20, marginBottom: 12 }}>
              <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 14 }}>CONTACT INFO</h3>
              {[
                { icon: '📍', label: 'Location', value: 'Swindon, Wiltshire, UK' },
                { icon: '📧', label: 'Email', value: 'info@swindonairsoft.com' },
                { icon: '🌐', label: 'Website', value: 'swindonairsoft.com' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '0.5px solid #1e2a1a', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, color: '#4a5e42', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>{c.label.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: '#c0d0b8' }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="tac-card" style={{ padding: 20 }}>
              <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 10 }}>RESPONSE TIMES</h3>
              <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.7 }}>
                We aim to respond to all enquiries within 24 hours during weekdays. For urgent queries on event days, please speak to a marshal on site.
              </p>
              <p style={{ fontSize: 12, color: '#4a5e42', lineHeight: 1.7, marginTop: 8 }}>
                For booking issues or refund requests, please include your booking reference number.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="tac-card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#6aaa48', letterSpacing: 2, marginBottom: 8 }}>MESSAGE SENT ✓</div>
                <p style={{ fontSize: 13, color: '#4a5e42' }}>Thanks for getting in touch. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="tac-card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#4a5e42', letterSpacing: 2, marginBottom: 16 }}>SEND A MESSAGE</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: 'name',    label: 'Your Name',    type: 'text',  required: true },
                    { key: 'email',   label: 'Email Address',type: 'email', required: true },
                    { key: 'subject', label: 'Subject',      type: 'text',  required: true },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="field-label">{f.label} {f.required && <span style={{ color: '#c04040' }}>*</span>}</label>
                      <input
                        type={f.type} required={f.required}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="field-input"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="field-label">Message <span style={{ color: '#c04040' }}>*</span></label>
                    <textarea
                      required rows={5}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="field-input"
                      style={{ resize: 'vertical', minHeight: 120 }}
                    />
                  </div>
                </div>
                {error && <p style={{ fontSize: 12, color: '#c04040', marginTop: 8 }}>{error}</p>}
                <button type="submit" disabled={sending} className="btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                  {sending ? 'SENDING…' : 'SEND MESSAGE →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
