// components/EventCard.js
import Link from 'next/link'
import { format } from 'date-fns'

const TYPE_GRADIENTS = {
  outdoor:  'linear-gradient(135deg, #0f2210 0%, #1a3a12 100%)',
  indoor:   'linear-gradient(135deg, #0d1a2a 0%, #12243a 100%)',
  milsim:   'linear-gradient(135deg, #1a2210 0%, #2a3518 100%)',
  cqb:      'linear-gradient(135deg, #0d1a2a 0%, #1a2030 100%)',
  default:  'linear-gradient(135deg, #0f1a0f 0%, #1a2a18 100%)',
}

export default function EventCard({ event, bookingCount = 0 }) {
  const spotsLeft = event.capacity - bookingCount
  const fillPct = Math.min(100, (bookingCount / event.capacity) * 100)

  const status =
    spotsLeft === 0 ? 'sold' :
    fillPct >= 70   ? 'filling' :
                      'open'

  const statusLabel = { open: 'OPEN', filling: 'FILLING FAST', sold: 'SOLD OUT' }[status]
  const statusClass = { open: 'badge-open', filling: 'badge-fill', sold: 'badge-sold' }[status]

  const gradient = TYPE_GRADIENTS[event.event_type] || TYPE_GRADIENTS.default

  const eventDate = new Date(event.event_date)

  return (
    <div className="tac-card overflow-hidden transition-transform hover:-translate-y-0.5 duration-200">
      {/* Header image area */}
      <div
        style={{
          height: 72,
          background: gradient,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '8px 10px',
        }}
      >
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>
          {event.event_type?.toUpperCase()}
        </span>
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '12px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#d0dcc8', marginBottom: 3, lineHeight: 1.3 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 10, color: '#4a5e42', marginBottom: 8, fontFamily: '"JetBrains Mono", monospace' }}>
          {format(eventDate, 'EEE d MMM')} · {event.start_time}–{event.end_time} · {event.location}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#6aaa48' }}>
              from £{event.price_walkon}
            </span>
          </div>
          <span style={{ fontSize: 10, color: '#3a4a34' }}>
            {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Sold out'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-track" style={{ marginBottom: 10 }}>
          <div
            className="progress-fill"
            style={{
              width: `${fillPct}%`,
              background: status === 'sold' ? '#8a3a3a' : status === 'filling' ? '#c8a030' : '#5a8c3a',
            }}
          />
        </div>

        <Link
          href={`/events/${event.id}`}
          className="btn-primary"
          style={{
            display: 'block',
            textAlign: 'center',
            textDecoration: 'none',
            padding: '8px',
            fontSize: 11,
            opacity: spotsLeft === 0 ? 0.5 : 1,
            pointerEvents: spotsLeft === 0 ? 'none' : 'auto',
          }}
        >
          {spotsLeft === 0 ? 'SOLD OUT' : 'VIEW & BOOK →'}
        </Link>
      </div>
    </div>
  )
}
