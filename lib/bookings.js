// lib/bookings.js
// ─────────────────────────────────────────────────────────────
// All database queries relating to bookings
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

/** Create a new booking */
export async function createBooking(payload) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Get bookings for a player */
export async function getPlayerBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      events (id, title, event_date, event_type, location)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Get all bookings, optionally filtered by event (admin) */
export async function getBookingsByEvent(eventId = null) {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      events (id, title, event_date),
      profiles (id, full_name, email, phone)
    `)
    .order('created_at', { ascending: false })

  if (eventId) query = query.eq('event_id', eventId)

  const { data, error } = await query
  if (error) throw error
  return data
}

/** Update a booking (admin) */
export async function updateBooking(id, payload) {
  const { data, error } = await supabase
    .from('bookings')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Cancel / refund a booking (admin) */
export async function cancelBooking(id, reason = '') {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Move booking to a different event date (admin) */
export async function moveBookingToEvent(bookingId, newEventId) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ event_id: newEventId, moved_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Get revenue stats (admin) */
export async function getRevenueStats() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('bookings')
    .select('amount_paid, created_at, package_type')
    .eq('status', 'confirmed')
    .gte('created_at', startOfMonth.toISOString())

  if (error) throw error

  const totalRevenue = data.reduce((sum, b) => sum + (b.amount_paid || 0), 0)
  const byType = data.reduce((acc, b) => {
    acc[b.package_type] = (acc[b.package_type] || 0) + (b.amount_paid || 0)
    return acc
  }, {})

  return { totalRevenue, byType, count: data.length }
}
