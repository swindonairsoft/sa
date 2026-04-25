// pages/api/contact.js
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, subject, message } = req.body
  if (!name || !email || !subject || !message) return res.status(400).json({ error: 'All fields required' })

  try {
    await resend.emails.send({
      from: 'Swindon Airsoft Website <noreply@swindonairsoft.com>',
      to: process.env.ADMIN_EMAIL || 'admin@swindonairsoft.com',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="background:#080c07;color:#e0e8d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
          <h2 style="color:#6aaa48;letter-spacing:2px">NEW CONTACT FORM MESSAGE</h2>
          <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="color:#4a5e42;padding:6px 0;border-bottom:1px solid #1e2a1a;width:30%">Name</td><td style="color:#e0e8d8;border-bottom:1px solid #1e2a1a">${name}</td></tr>
            <tr><td style="color:#4a5e42;padding:6px 0;border-bottom:1px solid #1e2a1a">Email</td><td style="color:#e0e8d8;border-bottom:1px solid #1e2a1a">${email}</td></tr>
            <tr><td style="color:#4a5e42;padding:6px 0">Subject</td><td style="color:#e0e8d8">${subject}</td></tr>
          </table>
          <div style="background:#0d1209;border:1px solid #1e2a1a;border-radius:4px;padding:16px">
            <p style="color:#8aab78;white-space:pre-wrap;margin:0">${message}</p>
          </div>
          <p style="color:#2e3e28;font-size:11px;margin-top:16px">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Contact email error:', err)
    res.status(500).json({ error: 'Failed to send' })
  }
}
