// lib/email.js
// ─────────────────────────────────────────────────────────────
// Email sending via Resend
// All transactional emails go through this file
// ─────────────────────────────────────────────────────────────
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Swindon Airsoft <noreply@swindonairsoft.com>'

/** Send booking confirmation with ticket */
export async function sendBookingConfirmation({ to, playerName, eventTitle, eventDate, bookingRef, players, packageType, amountPaid, ticketUrl }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Booking Confirmed — ${eventTitle} | Ref: ${bookingRef}`,
    html: `
      <div style="background:#080c07;color:#e0e8d8;font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <div style="border-bottom:1px solid #1e2a1a;padding-bottom:20px;margin-bottom:24px">
          <h1 style="font-size:24px;color:#6aaa48;letter-spacing:2px;margin:0">SWINDON AIRSOFT</h1>
          <p style="color:#4a5e42;font-size:11px;letter-spacing:2px;margin:4px 0 0">BOOKING CONFIRMATION</p>
        </div>
        <h2 style="color:#e0e8d8;font-size:18px;margin-bottom:4px">You're booked in, ${playerName}!</h2>
        <p style="color:#4a5e42;font-size:13px;margin-bottom:24px">Present this email or your ticket QR on arrival.</p>
        <div style="background:#0d1209;border:1px solid #1e2a1a;border-radius:6px;padding:20px;margin-bottom:20px">
          <table style="width:100%;font-size:13px;border-collapse:collapse">
            <tr><td style="color:#4a5e42;padding:6px 0;border-bottom:1px solid #1e2a1a">Event</td><td style="color:#e0e8d8;text-align:right;border-bottom:1px solid #1e2a1a">${eventTitle}</td></tr>
            <tr><td style="color:#4a5e42;padding:6px 0;border-bottom:1px solid #1e2a1a">Date</td><td style="color:#e0e8d8;text-align:right;border-bottom:1px solid #1e2a1a">${eventDate}</td></tr>
            <tr><td style="color:#4a5e42;padding:6px 0;border-bottom:1px solid #1e2a1a">Players</td><td style="color:#e0e8d8;text-align:right;border-bottom:1px solid #1e2a1a">${players}</td></tr>
            <tr><td style="color:#4a5e42;padding:6px 0;border-bottom:1px solid #1e2a1a">Package</td><td style="color:#e0e8d8;text-align:right;border-bottom:1px solid #1e2a1a">${packageType}</td></tr>
            <tr><td style="color:#4a5e42;padding:6px 0;border-bottom:1px solid #1e2a1a">Booking Ref</td><td style="color:#6aaa48;text-align:right;font-weight:600;border-bottom:1px solid #1e2a1a">${bookingRef}</td></tr>
            <tr><td style="color:#4a5e42;padding:6px 0">Amount Paid</td><td style="color:#6aaa48;text-align:right;font-weight:600">£${(amountPaid / 100).toFixed(2)}</td></tr>
          </table>
        </div>
        ${ticketUrl ? `<a href="${ticketUrl}" style="display:block;background:#5a8c3a;color:#fff;text-align:center;padding:12px;border-radius:4px;text-decoration:none;font-weight:600;letter-spacing:1px;margin-bottom:20px">VIEW YOUR TICKET</a>` : ''}
        <p style="color:#2e3e28;font-size:11px;line-height:1.6">Please arrive 15 minutes early for safety briefing. Eye protection must be worn at all times on the field. All equipment will be chronographed on arrival. Site rules are available at swindonairsoft.com/rules</p>
        <p style="color:#1e2a1a;font-size:11px;margin-top:16px">Swindon Airsoft · Swindon, Wiltshire · swindonairsoft.com</p>
      </div>
    `,
  })
}

/** Resend ticket to player */
export async function resendTicket({ to, playerName, eventTitle, bookingRef, ticketUrl }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your Ticket — ${eventTitle} | Ref: ${bookingRef}`,
    html: `
      <div style="background:#080c07;color:#e0e8d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6aaa48;letter-spacing:2px">SWINDON AIRSOFT</h1>
        <h2>Ticket for ${playerName}</h2>
        <p style="color:#4a5e42">Event: <strong style="color:#e0e8d8">${eventTitle}</strong></p>
        <p style="color:#4a5e42">Booking Ref: <strong style="color:#6aaa48">${bookingRef}</strong></p>
        ${ticketUrl ? `<a href="${ticketUrl}" style="display:block;background:#5a8c3a;color:#fff;text-align:center;padding:12px;border-radius:4px;text-decoration:none;margin-top:16px">VIEW TICKET</a>` : ''}
      </div>
    `,
  })
}

/** Waiver approval notification */
export async function sendWaiverApproved({ to, playerName }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Waiver Has Been Approved — Swindon Airsoft',
    html: `
      <div style="background:#080c07;color:#e0e8d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6aaa48;letter-spacing:2px">SWINDON AIRSOFT</h1>
        <h2>Waiver Approved ✓</h2>
        <p>Hi ${playerName}, your waiver has been reviewed and approved. You can now book events at Swindon Airsoft.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/events" style="display:block;background:#5a8c3a;color:#fff;text-align:center;padding:12px;border-radius:4px;text-decoration:none;margin-top:20px">BROWSE EVENTS</a>
      </div>
    `,
  })
}

/** Waiver rejection notification */
export async function sendWaiverRejected({ to, playerName, reason }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Waiver Review — Action Required | Swindon Airsoft',
    html: `
      <div style="background:#080c07;color:#e0e8d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6aaa48;letter-spacing:2px">SWINDON AIRSOFT</h1>
        <h2>Waiver Requires Attention</h2>
        <p>Hi ${playerName}, your waiver submission requires further review.</p>
        ${reason ? `<div style="background:#1a0a0a;border:1px solid #3a1a1a;border-radius:4px;padding:12px;margin:16px 0"><p style="color:#c04040;margin:0">${reason}</p></div>` : ''}
        <p>Please log in to your profile to update your waiver.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/profile/waiver" style="display:block;background:#5a8c3a;color:#fff;text-align:center;padding:12px;border-radius:4px;text-decoration:none;margin-top:20px">UPDATE WAIVER</a>
      </div>
    `,
  })
}

/** UKARA application confirmation */
export async function sendUkaraConfirmation({ to, playerName, applicationId }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'UKARA Application Received — Swindon Airsoft',
    html: `
      <div style="background:#080c07;color:#e0e8d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6aaa48;letter-spacing:2px">SWINDON AIRSOFT</h1>
        <h2>UKARA Application Received</h2>
        <p>Hi ${playerName}, we've received your UKARA application (Ref: ${applicationId}).</p>
        <p style="color:#4a5e42">We will review your application and issue your UKARA number within 5 working days. You will be notified by email once approved.</p>
      </div>
    `,
  })
}

/** UKARA approved — include number */
export async function sendUkaraApproved({ to, playerName, ukaraNumber, expiresAt }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `UKARA Approved — Number: ${ukaraNumber} | Swindon Airsoft`,
    html: `
      <div style="background:#080c07;color:#e0e8d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6aaa48;letter-spacing:2px">SWINDON AIRSOFT</h1>
        <h2>UKARA Application Approved ✓</h2>
        <p>Hi ${playerName}, congratulations — your UKARA registration has been approved.</p>
        <div style="background:#0d1209;border:1px solid #1e2a1a;border-radius:6px;padding:20px;margin:20px 0;text-align:center">
          <p style="color:#4a5e42;font-size:12px;letter-spacing:1px;margin:0 0 8px">YOUR UKARA NUMBER</p>
          <p style="color:#6aaa48;font-size:28px;font-weight:700;letter-spacing:4px;margin:0">${ukaraNumber}</p>
          <p style="color:#2e3e28;font-size:11px;margin:8px 0 0">Expires: ${expiresAt}</p>
        </div>
        <p style="color:#4a5e42;font-size:12px">Keep this number safe — you will need it when purchasing RIFs from UK retailers.</p>
      </div>
    `,
  })
}

/** Booking refund notification */
export async function sendRefundNotification({ to, playerName, eventTitle, bookingRef, amount }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Refund Processed — ${bookingRef} | Swindon Airsoft`,
    html: `
      <div style="background:#080c07;color:#e0e8d8;font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6aaa48;letter-spacing:2px">SWINDON AIRSOFT</h1>
        <h2>Refund Processed</h2>
        <p>Hi ${playerName}, a refund has been processed for your booking.</p>
        <p style="color:#4a5e42">Event: <strong style="color:#e0e8d8">${eventTitle}</strong></p>
        <p style="color:#4a5e42">Booking Ref: <strong style="color:#e0e8d8">${bookingRef}</strong></p>
        <p style="color:#4a5e42">Refund Amount: <strong style="color:#6aaa48">£${(amount / 100).toFixed(2)}</strong></p>
        <p style="color:#2e3e28;font-size:12px;margin-top:16px">Refunds typically appear in your account within 3–5 business days.</p>
      </div>
    `,
  })
}
