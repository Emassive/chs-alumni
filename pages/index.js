import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabaseClient'

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const target = new Date('2028-01-01T00:00:00')
    function update() {
      const now = new Date()
      const diff = target - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) return null

  const blocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      {blocks.map((b) => (
        <div key={b.label} className="glass-card rounded-xl px-3 py-2 sm:px-5 sm:py-3 text-center min-w-[60px] sm:min-w-[80px]">
          <div className="text-2xl sm:text-4xl font-bold text-gold-shimmer font-display tabular-nums">
            {String(b.value).padStart(b.label === 'Days' ? 3 : 2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-gold-300/70 uppercase tracking-widest mt-1">{b.label}</div>
        </div>
      ))}
    </div>
  )
}

function MusicNotes() {
  const notes = [
    { char: '\u266A', left: 5, top: 15, size: 24, delay: 0, duration: 7 },
    { char: '\u266B', left: 15, top: 60, size: 18, delay: 1.5, duration: 8 },
    { char: '\u266C', left: 85, top: 20, size: 20, delay: 0.8, duration: 6 },
    { char: '\u266A', left: 90, top: 55, size: 28, delay: 2.2, duration: 9 },
    { char: '\u266B', left: 50, top: 80, size: 16, delay: 3, duration: 7.5 },
    { char: '\u266A', left: 30, top: 10, size: 14, delay: 4, duration: 8.5 },
    { char: '\u266C', left: 70, top: 75, size: 22, delay: 1, duration: 6.5 },
    { char: '\u266B', left: 95, top: 85, size: 16, delay: 2.5, duration: 7 },
    { char: '\u266A', left: 8, top: 85, size: 20, delay: 3.5, duration: 8 },
    { char: '\u266C', left: 42, top: 5, size: 18, delay: 0.5, duration: 9 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {notes.map((n, i) => (
        <span
          key={i}
          className="absolute animate-float text-gold-500/15"
          style={{
            left: `${n.left}%`,
            top: `${n.top}%`,
            fontSize: n.size,
            animationDelay: `${n.delay}s`,
            animationDuration: `${n.duration}s`,
          }}
        >
          {n.char}
        </span>
      ))}
    </div>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 8,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 4 + Math.random() * 6,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [form, setForm] = useState({ full_name: '', email: '', graduation_year: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.full_name || !form.email) {
      setError('Please provide your full name and email.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year, 10) : null,
        message: form.message || null,
      }

      const { error: supaError } = await supabase.from('alumni').insert([payload]).select()

      if (supaError) {
        console.error('Supabase error:', supaError)
        setError(supaError.message || 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
        setForm({ full_name: '', email: '', graduation_year: '', message: '' })
      }
    } catch (err) {
      setError(err.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Alumni Registration | Conservatorium High School — 110th Celebrations 2028</title>
        <meta name="description" content="Conservatorium High School alumni — register your contact details ahead of our 110th anniversary celebrations in 2028." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-animated-gradient text-white relative">
        <FloatingParticles />
        <MusicNotes />

        {/* Top bar */}
        <nav className="relative z-10 flex items-center justify-center py-5 px-6">
          <span className="text-sm tracking-[0.2em] uppercase text-gold-300/60 font-body">
            Conservatorium High School
          </span>
        </nav>

        {/* Hero Section */}
        <header className="relative z-10 pt-8 sm:pt-16 pb-12 px-6 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse-slow" />
              <span className="text-sm text-gold-200 tracking-wide">110th Anniversary &middot; 2028</span>
            </div>
          </div>

          <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-7xl font-bold leading-tight max-w-4xl mx-auto" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <span className="text-white">A Small School,</span>
            <br />
            <span className="text-white/90">with a </span>
            <span className="text-gold-shimmer">Big Voice</span>
          </h1>

          <p className="animate-fade-in-up delay-200 opacity-0 mt-6 text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto leading-relaxed font-body">
            Attention Alumni! Register your contact details with us
            ahead of our <span className="text-gold-400 font-semibold">110th celebrations in 2028</span>.
          </p>

          <div className="animate-fade-in-up delay-400 opacity-0 mt-10">
            <Countdown />
          </div>

          <div className="animate-fade-in delay-500 opacity-0 mt-8">
            <a
              href="#register"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,168,40,0.4)] hover:-translate-y-0.5 font-body"
            >
              Register Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </header>

        {/* Divider accent */}
        <div className="relative z-10 flex justify-center py-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>

        {/* Registration Section */}
        <section id="register" className="relative z-10 px-6 pb-24 pt-8">
          <div className="max-w-xl mx-auto">
            {success ? (
              <div className="glass-card rounded-2xl p-10 text-center animate-fade-in-up">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gold-shimmer mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Thank You!
                </h2>
                <p className="text-navy-200 text-lg mb-6">
                  Your details have been registered. We&apos;ll be in touch as plans for the 110th celebrations take shape.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-gold-400 hover:text-gold-300 underline underline-offset-4 transition-colors"
                >
                  Register another person
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-8 sm:p-10 animate-fade-in-up">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Register Your Details
                  </h2>
                  <p className="text-navy-200 font-body">Join fellow Con High alumni for our milestone celebration.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gold-200/80 mb-1.5">
                      Full Name <span className="text-gold-500">*</span>
                    </label>
                    <input
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="input-fancy w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gold-200/80 mb-1.5">
                      Email <span className="text-gold-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="input-fancy w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gold-200/80 mb-1.5">
                      Graduation Year <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      name="graduation_year"
                      type="number"
                      value={form.graduation_year}
                      onChange={handleChange}
                      placeholder="e.g. 1995"
                      className="input-fancy w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gold-200/80 mb-1.5">
                      Message <span className="text-white/30">(optional)</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Share a memory or let us know your instrument..."
                      className="input-fancy w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none resize-none"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-300 text-sm">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 font-semibold py-3.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,168,40,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
          <p className="text-sm text-navy-300 font-body">
            Conservatorium High School &middot; 110th Anniversary Celebrations &middot; 2028
          </p>
        </footer>
      </div>
    </>
  )
}
