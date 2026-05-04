// lib/shop.js
// All database queries for the shop
import { getAdminClient } from './supabase'

export async function getCategories() {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('shop_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getProducts(categorySlug = null) {
  const supabase = getAdminClient()
  let query = supabase
    .from('shop_products')
    .select('*, shop_categories(id,name,slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (categorySlug) {
    query = query.eq('shop_categories.slug', categorySlug)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getProductBySlug(slug) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('shop_products')
    .select('*, shop_categories(id,name,slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getAllProductsAdmin() {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('shop_products')
    .select('*, shop_categories(id,name,slug)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getOrdersByUser(userId) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('shop_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllOrders(statusFilter = null) {
  const supabase = getAdminClient()
  let query = supabase
    .from('shop_orders')
    .select('*, profiles(full_name,email)')
    .order('created_at', { ascending: false })
  if (statusFilter) query = query.eq('status', statusFilter)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function updateOrderTracking(orderId, { trackingNumber, carrier, trackingUrl, trackingData }) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('shop_orders')
    .update({
      tracking_number:    trackingNumber,
      tracking_carrier:   carrier,
      tracking_url:       trackingUrl,
      tracking_data:      trackingData,
      tracking_updated_at: new Date().toISOString(),
      status:             'shipped',
      updated_at:         new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw error
  return data
}
