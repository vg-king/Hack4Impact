import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(216,90,48,0.15)', border: '1px solid rgba(216,90,48,0.3)' }}>
          <AlertTriangle className="w-8 h-8" style={{ color: 'var(--coral)' }} />
        </div>
        <h1 className="text-5xl font-bold text-gradient mb-3">404</h1>
        <p className="text-lg mb-2" style={{ color: 'var(--text)' }}>Page not found</p>
        <p className="text-sm mb-8" style={{ color: 'var(--text2)' }}>This page doesn't exist in MedNexus.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white"
          style={{ background: 'var(--gradient-primary)' }}>
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}