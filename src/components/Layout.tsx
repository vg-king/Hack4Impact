import { useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import UIAnimationEnhancer from './UIAnimationEnhancer'
import { AlertTriangle, Zap } from 'lucide-react'

export default function Layout() {
  const layoutRef = useRef<HTMLDivElement>(null)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/diagnostics', label: 'Diagnostics' },
    { to: '/find-care', label: 'Find Care' },
    { to: '/wellness', label: 'Wellness' },
  ]

  return (
    <div
      ref={layoutRef}
      className="relative isolate min-h-screen"
      style={{ background: 'transparent' }}
    >
      <UIAnimationEnhancer scope={layoutRef} />

      <header
        className="fixed top-0 left-0 right-0 z-40 h-14"
        style={{ background: 'rgba(5, 14, 20, 0.82)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-[1280px] mx-auto h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gradient leading-none">MedNexus</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text3)' }}>AI Healthcare v3</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${isActive ? 'glass' : ''}`
                }
                style={({ isActive }) => ({ color: isActive ? 'var(--text)' : 'var(--text2)' })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/emergency"
            className="px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2"
            style={{ background: 'rgba(170, 36, 36, 0.22)', color: '#ff8e8e', border: '1px solid rgba(230, 88, 88, 0.5)' }}
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency SOS
          </NavLink>
        </div>
      </header>

      <main className="relative z-10 pt-14 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}