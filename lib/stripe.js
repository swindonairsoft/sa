// lib/stripe.js
// ─────────────────────────────────────────────────────────────
// Stripe payment helpers (server-side only)
// ─────────────────────────────────────────────────────────────
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

/** Create a Stripe checkout session for a booking */
export async function createBookingCheckout({ bookingId, eventTitle, eventDate, players, packageType, amountPence, customerEmail, successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          unit_amount: amountPence,
          product_data: {
            name: `${eventTitle} — ${players} player${players > 1 ? 's' : ''}`,
            description: `${packageType} · ${eventDate}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      booking_id: bookingId,
      type: 'booking',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
  return session
}

/** Create a Stripe checkout session for UKARA application */
export async function createUkaraCheckout({ applicationId, customerEmail, successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          unit_amount: 500, // £5.00
          product_data: {
            name: 'UKARA Annual Registration',
            description: 'UKARA membership registration via Swindon Airsoft — valid for 12 months',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      application_id: applicationId,
      type: 'ukara',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
  return session
}

/** Process a refund via Stripe */
export async function createRefund(paymentIntentId, amountPence = null) {
  const refundData = { payment_intent: paymentIntentId }
  if (amountPence) refundData.amount = amountPence

  const refund = await stripe.refunds.create(refundData)
  return refund
}

/** Verify webhook signature */
export function constructWebhookEvent(body, signature) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
}
