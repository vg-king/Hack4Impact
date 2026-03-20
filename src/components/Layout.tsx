import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50">
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg glass">
        <Menu className="w-5 h-5" style={{ color: 'var(--teal)' }} />
      </button>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}