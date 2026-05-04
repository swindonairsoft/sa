// pages/api/shop/checkout.js
import { getSessionFromRequest, getAdminClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { items, shippingAddress } = req.body
  if (!items?.length) return res.status(400).json({ error: 'No items in cart' })

  const supabase = getAdminClient()

  // Fetch all products
  const productIds = items.map(i => i.productId)
  const { data: products, error: prodErr } = await supabase
    .from('shop_products')
    .select('*')
    .in('id', productIds)
    .eq('is_active', true)

  if (prodErr) return res.status(500).json({ error: prodErr.message })

  // Validate stock and build line items
  const lineItems = []
  let subtotal = 0

  for (const item of items) {
    const product = products.find(p => p.id === item.productId)
    if (!product) return res.status(400).json({ error: `Product not found: ${item.productId}` })
    if (product.stock < item.qty) return res.status(400).json({ error: `Insufficient stock for ${product.name}` })

    // Check UKARA if required
    if (product.requires_ukara) {
      const { data: profile } = await supabase.from('profiles').select('ukara_number').eq('id', session.user.id).maybeSingle()
      if (!profile?.ukara_number) return res.status(400).json({ error: `${product.name} requires a valid UKARA number.` })
    }

    const itemTotal = product.price * item.qty
    subtotal += itemTotal
    lineItems.push({
      price_data: {
        currency: 'gbp',
        unit_amount: product.price,
        product_data: {
          name: item.variants ? `${product.name} (${Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(', ')})` : product.name,
          description: product.description?.slice(0, 200),
        },
      },
      quantity: item.qty,
    })
  }

  // Free shipping over £50, else £3.99
  const shippingCost = subtotal >= 5000 ? 0 : 399
  const total = subtotal + shippingCost

  // Add shipping line item if applicable
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'gbp',
        unit_amount: shippingCost,
        product_data: { name: 'Standard Shipping (3-5 days)' },
      },
      quantity: 1,
    })
  }

  // Create order record
  const { data: order, error: orderErr } = await supabase
    .from('shop_orders')
    .insert({
      user_id:       session.user.id,
      items:         items.map(i => ({ ...i, product: products.find(p => p.id === i.productId)?.name })),
      subtotal,
      shipping_cost: shippingCost,
      total,
      status:        'pending',
    })
    .select()
    .single()

  if (orderErr) return res.status(500).json({ error: orderErr.message })

  // Create Stripe checkout
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return res.status(500).json({ error: 'Payment system not configured yet.' })

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    const { data: profile } = await supabase.from('profiles').select('email').eq('id', session.user.id).maybeSingle()

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: profile?.email || session.user.email,
      line_items: lineItems,
      metadata: { order_id: order.id, type: 'shop_order' },
      shipping_address_collection: { allowed_countries: ['GB'] },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/order-success?ref=${order.order_ref}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
    })

    await supabase.from('shop_orders').update({ stripe_session_id: checkoutSession.id }).eq('id', order.id)
    res.status(200).json({ checkoutUrl: checkoutSession.url })
  } catch (e) {
    await supabase.from('shop_orders').delete().eq('id', order.id)
    res.status(500).json({ error: e.message })
  }
}
