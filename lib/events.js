// lib/events.js
// ─────────────────────────────────────────────────────────────
// All database queries relating to events
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

/** Fetch all upcoming events (public) */
export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
  if (error) throw error
  return data
}

/** Fetch a single event by ID */
export async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

/** Fetch all events (admin) */
export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*, bookings(count)')
    .order('event_date', { ascending: false })
  if (error) throw error
  return data
}

/** Create a new event (admin) */
export async function createEvent(payload) {
  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Update an event (admin) */
export async function updateEvent(id, payload) {
  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Delete an event (admin) */
export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

/** Get booking count for an event */
export async function getEventBookingCount(eventId) {
  const { count, error } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .neq('status', 'cancelled')
  if (error) throw error
  return count || 0
}
