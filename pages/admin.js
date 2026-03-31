import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabaseClient'

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(false)
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS

  function handleLogin(e) {
    e.preventDefault()
    if (password === adminPass) {
      setAuthenticated(true)
      setAuthError(false)
    } else {
      setAuthError(true)
    }
  }

  async function fetchAlumni() {
    setLoading(true)
    setError(null)
    const { data, error: supaError } = await supabase
      .from('alumni')
      .select('*')
      .order(sortField, { ascending: sortDir === 'asc' })

    if (supaError) {
      console.error('Supabase error:', supaError)
      setError(supaError.message)
    } else {
      setAlumni(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) fetchAlumni()
  }, [sortField, sortDir, authenticated])

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="text-navy-500 ml-1">&#8597;</span>
    return <span className="text-gold-400 ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
  }

  const filtered = alumni.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.full_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      String(a.graduation_year || '').includes(q) ||
      a.address?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.instruments?.toLowerCase().includes(q) ||
      a.school_house?.toLowerCase().includes(q) ||
      a.family_members?.toLowerCase().includes(q)
    )
  })

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to remove this registration?')) return
    const { error: supaError } = await supabase.from('alumni').delete().eq('id', id)
    if (supaError) {
      alert('Error deleting: ' + supaError.message)
    } else {
      setAlumni((prev) => prev.filter((a) => a.id !== id))
    }
  }

  async function handleExportCSV() {
    const headers = ['Name', 'Address', 'Phone', 'Email', 'Graduation Year', 'Instruments', 'School House', 'Family Members', 'Registered At']
    const rows = filtered.map((a) => [
      a.full_name,
      a.address || '',
      a.phone || '',
      a.email,
      a.graduation_year || '',
      a.instruments || '',
      a.school_house || '',
      (a.family_members || '').replace(/"/g, '""'),
      a.created_at ? new Date(a.created_at).toLocaleString() : '',
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `alumni-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Admin Login | Alumni Registrations</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        </Head>
        <div className="min-h-screen bg-animated-gradient text-white flex items-center justify-center px-6">
          <div className="glass-card rounded-2xl p-8 sm:p-10 w-full max-w-sm animate-fade-in-up">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Admin Access
              </h1>
              <p className="text-sm text-navy-300">Enter the admin password to continue.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(false) }}
                placeholder="Password"
                className="input-fancy w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none"
                autoFocus
              />
              {authError && (
                <p className="text-red-400 text-sm">Incorrect password.</p>
              )}
              <button
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Sign In
              </button>
            </form>
            <div className="mt-4 text-center">
              <a href="/" className="text-xs text-navy-400 hover:text-gold-400 transition-colors">&larr; Back to site</a>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin | Alumni Registrations</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-animated-gradient text-white">
        {/* Header */}
        <header className="border-b border-white/10 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Alumni Admin
              </h1>
              <p className="text-sm text-navy-300 mt-0.5">Conservatorium High School &middot; 110th Celebrations</p>
            </div>
            <a
              href="/"
              className="text-sm text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-4"
            >
              &larr; Back to site
            </a>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-5">
              <div className="text-sm text-navy-300 mb-1">Total Registrations</div>
              <div className="text-3xl font-bold text-gold-shimmer">{alumni.length}</div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="text-sm text-navy-300 mb-1">With Graduation Year</div>
              <div className="text-3xl font-bold text-white">
                {alumni.filter((a) => a.graduation_year).length}
              </div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="text-sm text-navy-300 mb-1">With Instruments</div>
              <div className="text-3xl font-bold text-white">
                {alumni.filter((a) => a.instruments).length}
              </div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="text-sm text-navy-300 mb-1">With Family Links</div>
              <div className="text-3xl font-bold text-white">
                {alumni.filter((a) => a.family_members).length}
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, year, or message..."
                className="input-fancy w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 outline-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchAlumni}
                className="px-4 py-2.5 glass-card rounded-lg text-sm text-gold-300 hover:text-gold-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                disabled={filtered.length === 0}
                className="px-4 py-2.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-900 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <svg className="animate-spin w-8 h-8 mx-auto text-gold-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-navy-300 mt-4">Loading registrations...</p>
            </div>
          ) : error ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <div className="text-red-400 text-lg font-semibold mb-2">Error loading data</div>
              <p className="text-red-300/70 text-sm mb-4">{error}</p>
              <button onClick={fetchAlumni} className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="text-5xl mb-4 opacity-30">&#9835;</div>
              <p className="text-navy-300 text-lg">
                {search ? 'No results match your search.' : 'No registrations yet. Share the site to get started!'}
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th onClick={() => handleSort('full_name')} className="text-left px-4 py-3.5 text-gold-200/80 font-medium cursor-pointer hover:text-gold-200 select-none whitespace-nowrap">
                        Name <SortIcon field="full_name" />
                      </th>
                      <th className="text-left px-4 py-3.5 text-gold-200/80 font-medium whitespace-nowrap">Address</th>
                      <th className="text-left px-4 py-3.5 text-gold-200/80 font-medium whitespace-nowrap">Phone</th>
                      <th onClick={() => handleSort('email')} className="text-left px-4 py-3.5 text-gold-200/80 font-medium cursor-pointer hover:text-gold-200 select-none whitespace-nowrap">
                        Email <SortIcon field="email" />
                      </th>
                      <th onClick={() => handleSort('graduation_year')} className="text-left px-4 py-3.5 text-gold-200/80 font-medium cursor-pointer hover:text-gold-200 select-none whitespace-nowrap">
                        Year <SortIcon field="graduation_year" />
                      </th>
                      <th className="text-left px-4 py-3.5 text-gold-200/80 font-medium whitespace-nowrap">Instruments</th>
                      <th onClick={() => handleSort('school_house')} className="text-left px-4 py-3.5 text-gold-200/80 font-medium cursor-pointer hover:text-gold-200 select-none whitespace-nowrap">
                        House <SortIcon field="school_house" />
                      </th>
                      <th className="text-left px-4 py-3.5 text-gold-200/80 font-medium whitespace-nowrap">Family at Con High</th>
                      <th onClick={() => handleSort('created_at')} className="text-left px-4 py-3.5 text-gold-200/80 font-medium cursor-pointer hover:text-gold-200 select-none whitespace-nowrap">
                        Registered <SortIcon field="created_at" />
                      </th>
                      <th className="px-4 py-3.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">{a.full_name}</td>
                        <td className="px-4 py-3.5 text-navy-200 max-w-[180px] truncate">{a.address || '—'}</td>
                        <td className="px-4 py-3.5 text-navy-200 whitespace-nowrap">{a.phone || '—'}</td>
                        <td className="px-4 py-3.5 text-navy-200">{a.email}</td>
                        <td className="px-4 py-3.5 text-navy-200">{a.graduation_year || '—'}</td>
                        <td className="px-4 py-3.5 text-navy-200 max-w-[150px] truncate">{a.instruments || '—'}</td>
                        <td className="px-4 py-3.5 text-navy-200">{a.school_house || '—'}</td>
                        <td className="px-4 py-3.5 text-navy-200 max-w-[200px] truncate">{a.family_members || '—'}</td>
                        <td className="px-4 py-3.5 text-navy-300 text-xs whitespace-nowrap">
                          {a.created_at ? new Date(a.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="text-red-400/50 hover:text-red-400 transition-colors"
                            title="Remove registration"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Count footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-4 text-sm text-navy-400 text-right">
              Showing {filtered.length} of {alumni.length} registration{alumni.length !== 1 ? 's' : ''}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
