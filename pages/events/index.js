// pages/events/index.js
import Layout from '../../components/Layout'
import EventCard from '../../components/EventCard'
import { getUpcomingEvents, getEventBookingCount } from '../../lib/events'

export default function EventsPage({ session, events = [] }) {
  return (
    <Layout session={session} title="Events" description="Browse all upcoming airsoft events at Swindon Airsoft.">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div style={{ marginBottom: 32 }}>
          <div className="section-eyebrow">WHAT'S ON</div>
          <h1 className="section-title" style={{ fontSize: 32 }}>UPCOMING EVENTS</h1>
          <p style={{ fontSize: 13, color: '#4a5e42', marginTop: 6 }}>
            All events are walk-on friendly. Hire packages include unlimited BBs.
            You must have a signed waiver to book.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map(e => (
              <EventCard key={e.id} event={e} bookingCount={e.booking_count || 0} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#0d1209', border: '0.5px solid #1e2a1a', borderRadius: 6,
          }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: '#2e3e28', letterSpacing: 2, marginBottom: 8 }}>
              NO EVENTS SCHEDULED
            </div>
            <p style={{ fontSize: 13, color: '#3a4a34' }}>
              Check back soon — events are added regularly.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const events = await getUpcomingEvents()
    const eventsWithCounts = await Promise.all(
      events.map(async (e) => ({
        ...e,
        booking_count: await getEventBookingCount(e.id),
      }))
    )
    return { props: { events: eventsWithCounts } }
  } catch (err) {
    console.error(err)
    return { props: { events: [] } }
  }
}
