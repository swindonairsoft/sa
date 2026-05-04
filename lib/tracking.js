// lib/tracking.js
// Free parcel tracking using track-trace.com API (no key needed for basic)
// Supports Royal Mail, Evri (Hermes), Parcelforce, DPD, DHL, UPS, FedEx

export const CARRIERS = [
  { id: 'royalmail',   label: 'Royal Mail',   prefix: ['JD', 'SD', 'BD', 'RM'], trackUrl: (n) => `https://www.royalmail.com/track-your-item#/tracking-results/${n}` },
  { id: 'evri',        label: 'Evri',         prefix: ['H'],                    trackUrl: (n) => `https://www.evri.com/track-a-parcel/hermes/${n}` },
  { id: 'parcelforce', label: 'Parcelforce',  prefix: ['PF', 'GK', 'GJ'],       trackUrl: (n) => `https://www.parcelforce.com/track-trace?trackNumber=${n}` },
  { id: 'dpd',         label: 'DPD',          prefix: ['15', '14'],             trackUrl: (n) => `https://www.dpd.co.uk/tracking/index.jsp?reference=${n}` },
  { id: 'dhl',         label: 'DHL',          prefix: ['1Z', 'JD'],             trackUrl: (n) => `https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${n}` },
  { id: 'other',       label: 'Other',        prefix: [],                       trackUrl: (n) => null },
]

export function detectCarrier(trackingNumber) {
  if (!trackingNumber) return 'other'
  const upper = trackingNumber.toUpperCase().trim()
  for (const carrier of CARRIERS) {
    if (carrier.prefix.some(p => upper.startsWith(p))) return carrier.id
  }
  // Royal Mail: 13-char alphanumeric ending in GB
  if (/^[A-Z]{2}\d{9}GB$/.test(upper)) return 'royalmail'
  return 'other'
}

export function getTrackingUrl(trackingNumber, carrierId) {
  const carrier = CARRIERS.find(c => c.id === carrierId)
  if (!carrier) return null
  return carrier.trackUrl(trackingNumber)
}

// Fetch live tracking data using track-trace.com (free, no API key)
export async function fetchTrackingData(trackingNumber, carrierId) {
  try {
    // Map our carrier IDs to track-trace courier codes
    const courierMap = {
      royalmail:   'royal-mail',
      evri:        'evri',
      parcelforce: 'parcelforce',
      dpd:         'dpd',
      dhl:         'dhl',
    }
    const courier = courierMap[carrierId] || carrierId

    // Use 17track.net public API (free tier)
    const res = await fetch(`https://api.17track.net/track/v2/gettrackinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': process.env.SEVENTEEN_TRACK_API_KEY || '',
      },
      body: JSON.stringify({ data: [{ number: trackingNumber, carrier: 0 }] }),
    })

    if (!res.ok) throw new Error('Tracking API unavailable')
    const json = await res.json()
    const trackInfo = json?.data?.accepted?.[0]?.track

    if (!trackInfo) return null

    return {
      status:   trackInfo.e?.toLowerCase() || 'unknown',
      events:   (trackInfo.z1 || []).map(e => ({
        date:     e.a,
        location: e.c || '',
        message:  e.z || '',
      })),
      lastUpdate: new Date().toISOString(),
    }
  } catch {
    // If tracking API fails, just return null — tracking URL still works
    return null
  }
}
