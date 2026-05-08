// pages/admin/ukara.js
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/apiFetch'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AdminUkaraPage({ session }) {
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [isAdmin, setIsAdmin]           = useState(false)
  const [filter,  setFilter]            = useState('pending_review')
  const [msg,     setMsg]               = useState('')

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    apiFetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.isAdmin) { router.push('/'); return }
      setIsAdmin(true)
      loadData()
    })
  }, [session])

  const loadData = () => {
    apiFetch('/api/admin/ukara').then(r => r.json()).then(d => {
      setApplications(d.applications || [])
      setLoading(false)
    })
  }

  const handleApprove = async (id) => {
    const ukaraNumber = prompt('Enter UKARA number to assign (e.g. SA-2025-0001):')
    if (!ukaraNumber) return
    const res = await apiFetch('/api/admin/ukara/approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ukaraNumber }),
    })
    const d = await res.json()
    if (res.ok) { setMsg('UKARA approved and number assigned.'); loadData() }
    else setMsg(d.error || 'Error')
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:') || ''
    const res = await apiFetch('/api/admin/ukara/reject', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reason }),
    })
    const d = await res.json()
    if (res.ok) { setMsg('Application rejected.'); loadData() }
    else setMsg(d.error || 'Error')
  }

  const filtered = applications.filter(a => filter === 'all' || a.status === filter)

  if (!isAdmin || loading) return <AdminLayout session={session} title="UKARA Admin"><div className="max-w-4xl mx-auto px-4 py-20 text-center"><p style={{ color: '#4a5e42' }}>Loading…</p></div></AdminLayout>

  return (
    <AdminLayout session={session} title="UKARA Applications">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div style={{ marginBottom: 24 }}>
          <div className="section-eyebrow">ADMIN</div>
          <h1 className="section-title" style={{ fontSize: 28 }}>UKARA APPLICATIONS</h1>
        </div>

        {msg && <p style={{ fontSize: 12, color: msg.includes('Error') ? '#c04040' : '#6aaa48', marginBottom: 16 }}>{msg}</p>}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['all','All'],['pending_review','Pending Review'],['approved','Approved'],['rejected','Rejected']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ fontSize: 10, padding: '5px 12px', borderRadius: 2, cursor: 'pointer', background: filter === val ? 'rgba(106,170,72,0.1)' : 'transparent', color: filter === val ? '#6aaa48' : '#4a5e42', border: `0.5px solid ${filter === val ? 'rgba(106,170,72,0.3)' : '#1e2a1a'}` }}>
              {label} ({applications.filter(a => val === 'all' || a.status === val).length})
            </button>
          ))}
        </div>

        <div className="tac-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: 700 }}>
              <thead>
                <tr><th>PLAYER</th><th>APPLIED</th><th>GAME DAYS</th><th>PAID</th><th>STATUS</th><th>UKARA NO.</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ color: '#a0b090', fontWeight: 500, fontSize: 12 }}>{a.profiles?.full_name}</div>
                      <div style={{ fontSize: 10, color: '#4a5e42' }}>{a.profiles?.email}</div>
                    </td>
                    <td style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace' }}>{a.applied_at ? format(new Date(a.applied_at), 'd MMM yyyy') : '—'}</td>
                    <td style={{ fontSize: 12, color: '#6aaa48', fontWeight: 600, textAlign: 'center' }}>{a.game_day_count || '—'}</td>
                    <td style={{ fontSize: 12, color: '#6aaa48' }}>£{parseFloat(a.amount_paid || 5).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${a.status === 'approved' ? 'badge-paid' : a.status === 'pending_review' ? 'badge-pend' : a.status === 'rejected' ? 'badge-sold' : 'badge-pend'}`} style={{ fontSize: 9 }}>
                        {a.status?.toUpperCase().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: '#6aaa48', fontFamily: '"JetBrains Mono", monospace' }}>{a.ukara_number || '—'}</td>
                    <td>
                      {a.status === 'pending_review' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleApprove(a.id)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(106,170,72,0.1)', color: '#6aaa48', border: '0.5px solid rgba(106,170,72,0.25)', cursor: 'pointer' }}>APPROVE</button>
                          <button onClick={() => handleReject(a.id)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(192,64,64,0.1)', color: '#c04040', border: '0.5px solid rgba(192,64,64,0.25)', cursor: 'pointer' }}>REJECT</button>
                        </div>
                      )}
                      {a.status === 'approved' && <span style={{ fontSize: 10, color: '#3a4a34' }}>Expires {a.expires_at ? format(new Date(a.expires_at), 'd MMM yyyy') : '—'}</span>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2e3e28', padding: 24 }}>No applications found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
