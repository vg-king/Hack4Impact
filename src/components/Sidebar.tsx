import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bot, FileSearch, MapPin, Pill, Apple, AlertTriangle,
  Activity, Heart, X, Zap, Brain, Dna, Watch, Lock, Stethoscope, Camera, ScrollText } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'var(--teal)' },
  { path: '/ai-assistant', icon: Bot, label: 'AI Assistant', color: 'var(--indigo)' },
  { path: '/prescription-ocr', icon: ScrollText, label: 'Prescription OCR', color: '#a78bfa' },
  { path: '/cv-detection', icon: Camera, label: 'CV Disease Detect', color: '#f472b6' },
  { path: '/file-analyzer', icon: FileSearch, label: 'File Analyzer', color: '#a78bfa' },
  { path: '/find-doctors', icon: MapPin, label: 'Find Doctors', color: 'var(--emerald)' },
  { path: '/pharmacy', icon: Pill, label: 'Pharmacy Finder', color: 'var(--amber)' },
  { path: '/diet', icon: Apple, label: 'Diet Plans', color: '#86efac' },
  { path: '/emergency', icon: AlertTriangle, label: 'Emergency SOS', color: 'var(--coral)' },
  { path: '/hospital-ops', icon: Activity, label: 'Hospital Ops', color: '#67e8f9' },
  { path: '/mental-health', icon: Heart, label: 'Mental Health', color: 'var(--coral)' },
  { path: '/predictive-risk', icon: Brain, label: 'Risk Predictor', color: '#D85A30' },
  { path: '/genomics', icon: Dna, label: 'Genomics', color: '#7F77DD' },
  { path: '/iot-wearables', icon: Watch, label: 'IoT Wearables', color: 'var(--teal)' },
  { path: '/blockchain-ehr', icon: Lock, label: 'Blockchain EHR', color: '#378ADD' },
  { path: '/drug-interactions', icon: Stethoscope, label: 'Drug Interactions', color: 'var(--amber)' },
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="w-[220px] flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg,#040d12,#050f1a)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-gradient">MedNexus</h1>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>AI Healthcare v3</p>
          </div>
        </div>
        {onClose && <button onClick={onClose} style={{ color: 'var(--text3)' }}><X className="w-4 h-4" /></button>}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item, i) => (
          <motion.div key={item.path} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <NavLink to={item.path} end={item.path === '/'} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 group ${isActive ? 'nav-active' : ''}`}
              style={({ isActive }) => ({ color: isActive ? item.color : 'var(--text2)' })}>
              {({ isActive }) => (
                <>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? `${item.color}22` : 'transparent' }}>
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && <div className="ml-auto w-1 h-1 rounded-full" style={{ background: item.color }} />}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="rounded-lg p-2.5 flex items-center gap-2"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--gradient-primary)' }}>TN</div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>Team Nemesis</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>KIIT · HACK4IMPACT</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--emerald)' }} />
        </div>
      </div>
    </aside>
  )
}