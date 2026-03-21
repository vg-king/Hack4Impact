import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!loading) {
      setProgress(0)
      return
    }

    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 4, 96)
        return next
      })
    }, 80)

    return () => window.clearInterval(timer)
  }, [loading])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!loginId.trim() || !password.trim()) return

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2200))
    setProgress(100)
    await new Promise((resolve) => setTimeout(resolve, 320))

    localStorage.setItem('mednexus_session', JSON.stringify({ loginId, at: Date.now() }))
    navigate('/')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,170,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(0,125,255,0.12),transparent_45%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-8">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2">
          <section className="hidden lg:flex lg:flex-col lg:justify-center">
            <div className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-emerald-400/25 bg-emerald-300/5 px-4 py-2 text-xs tracking-[0.24em] text-emerald-300">
              NEURAL ACCESS GATEWAY
            </div>
            <div className="mb-8">
              <div className="med-logo mb-6">
                <span className="med-ring" />
                <span className="med-cross" />
                <span className="med-pulse" />
              </div>
              <h1 className="mb-4 text-5xl font-black leading-tight text-cyan-100">
                MEDNEXUS
                <br />
                <span className="text-emerald-300">SECURE LINK</span>
              </h1>
              <p className="max-w-md text-sm leading-7 text-cyan-200/70">
                Enter the clinical command grid and unlock AI diagnostics, emergency systems, and predictive care modules.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-cyan-200/70">
              <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">BIO-SIGNAL SYNC: ACTIVE</div>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">ENCRYPTION: QUANTUM</div>
            </div>
          </section>

          <section className="relative mx-auto w-full max-w-md rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-7 shadow-[0_0_60px_rgba(0,255,170,0.16)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 lg:hidden">
              <div className="med-logo mb-5 scale-90">
                <span className="med-ring" />
                <span className="med-cross" />
                <span className="med-pulse" />
              </div>
              <h2 className="text-3xl font-bold tracking-wide text-cyan-100">MEDNEXUS LOGIN</h2>
            </div>

            <h2 className="mb-1 text-2xl font-bold text-cyan-100">Identity Verification</h2>
            <p className="mb-7 text-sm text-cyan-200/70">Authenticate to enter the healthcare control deck.</p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-cyan-300/80">Login ID</label>
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="doctor.neural@mednexus.ai"
                  className="w-full rounded-xl border border-cyan-300/25 bg-slate-900/75 px-4 py-3 text-cyan-100 outline-none transition focus:border-emerald-300/70 focus:shadow-[0_0_20px_rgba(0,255,170,0.2)]"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-cyan-300/80">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full rounded-xl border border-cyan-300/25 bg-slate-900/75 px-4 py-3 text-cyan-100 outline-none transition focus:border-emerald-300/70 focus:shadow-[0_0_20px_rgba(0,255,170,0.2)]"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 inline-flex w-full items-center justify-center overflow-hidden rounded-xl border border-emerald-300/55 bg-gradient-to-r from-emerald-400/30 to-cyan-400/25 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:shadow-[0_0_26px_rgba(0,255,170,0.33)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
                {loading ? 'SYNCING NEURAL CREDENTIALS' : 'ENTER MEDNEXUS'}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-cyan-300/18 bg-cyan-300/5 p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-cyan-300/70">System Load Sequence</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-200 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-cyan-200/70">
                <span>{loading ? 'Initializing secure bio-grid...' : 'Standby for neural authentication'}</span>
                <span>{progress}%</span>
              </div>
              {loading ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-200/90">
                  <span className="loader-dot" />
                  <span className="loader-dot" />
                  <span className="loader-dot" />
                  <span>Holographic health matrix loading...</span>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .med-logo {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
        }
        .med-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(0, 255, 174, 0.56);
          box-shadow: 0 0 26px rgba(0, 255, 174, 0.35), inset 0 0 18px rgba(0, 255, 174, 0.28);
          animation: ringSpin 8s linear infinite;
        }
        .med-cross {
          position: absolute;
          inset: 28%;
          border-radius: 18px;
          background:
            linear-gradient(90deg, transparent 38%, rgba(96, 255, 223, 0.95) 38%, rgba(96, 255, 223, 0.95) 62%, transparent 62%),
            linear-gradient(0deg, transparent 38%, rgba(96, 255, 223, 0.95) 38%, rgba(96, 255, 223, 0.95) 62%, transparent 62%);
          filter: drop-shadow(0 0 10px rgba(0, 255, 174, 0.7));
          animation: pulseCross 1.8s ease-in-out infinite;
        }
        .med-pulse {
          position: absolute;
          left: -28px;
          right: -28px;
          top: 50%;
          height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, rgba(0, 255, 174, 0.9), rgba(0, 182, 255, 0.9), transparent);
          box-shadow: 0 0 18px rgba(0, 255, 174, 0.75);
          animation: pulseLine 2.4s ease-in-out infinite;
        }
        .loader-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(108, 255, 220, 0.9);
          box-shadow: 0 0 10px rgba(108, 255, 220, 0.8);
          animation: loaderBounce 0.8s infinite ease-in-out;
        }
        .loader-dot:nth-child(2) {
          animation-delay: 0.12s;
        }
        .loader-dot:nth-child(3) {
          animation-delay: 0.24s;
        }
        @keyframes ringSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseCross {
          0%, 100% { transform: scale(0.96); opacity: 0.72; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes pulseLine {
          0%, 100% { opacity: 0.4; transform: translateY(-50%) scaleX(0.85); }
          50% { opacity: 1; transform: translateY(-50%) scaleX(1.07); }
        }
        @keyframes loaderBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
