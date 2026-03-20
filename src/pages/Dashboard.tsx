import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Activity, Bed, Stethoscope, ArrowRight, Sparkles, Brain, Dna, Watch, Lock, Camera, ScrollText } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../components/StatCard'

const weeklyData = [
  { day: 'Mon', patients: 120, diagnosed: 95 },
  { day: 'Tue', patients: 150, diagnosed: 130 },
  { day: 'Wed', patients: 180, diagnosed: 160 },
  { day: 'Thu', patients: 140, diagnosed: 125 },
  { day: 'Fri', patients: 200, diagnosed: 180 },
  { day: 'Sat', patients: 90, diagnosed: 75 },
  { day: 'Sun', patients: 70, diagnosed: 60 },
]

const features = [
  { icon: Brain, title: 'AI Assistant', desc: 'Gemini-powered symptom triage', path: '/ai-assistant', color: 'var(--indigo)' },
  { icon: ScrollText, title: 'Prescription OCR', desc: 'Read any handwritten prescription', path: '/prescription-ocr', color: '#a78bfa' },
  { icon: Camera, title: 'CV Disease Detect', desc: 'YOLO + Gemini body analysis', path: '/cv-detection', color: '#f472b6' },
  { icon: Dna, title: 'Genomics', desc: 'SNP analysis & drug-gene safety', path: '/genomics', color: '#7F77DD' },
  { icon: Watch, title: 'IoT Wearables', desc: 'Live vitals from Apple Watch & more', path: '/iot-wearables', color: 'var(--teal)' },
  { icon: Lock, title: 'Blockchain EHR', desc: 'Patient-owned zero-knowledge records', path: '/blockchain-ehr', color: '#378ADD' },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-grid">
      <div className="relative overflow-hidden px-6 lg:px-10 pt-10 pb-16"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,200,160,0.02)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--teal), transparent)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--teal)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--teal)' }}>HACK4IMPACT · Track 2 · Team Nemesis</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">Welcome to <span className="text-gradient">MedNexus</span></h1>
          <p className="text-base max-w-2xl" style={{ color: 'var(--text2)' }}>
            Unified AI clinical intelligence · Hospital operations · Patient care · 17 modules
          </p>
        </motion.div>
      </div>

      <div className="p-6 lg:p-10 space-y-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Patients today" value="1,284" sub="↑ 12%" color="var(--teal)" delay={0} />
          <StatCard icon={Activity} label="AI diagnoses" value="847" sub="↑ 8%" color="var(--emerald)" delay={0.05} />
          <StatCard icon={Bed} label="Beds available" value="80" sub="79% full" color="var(--amber)" delay={0.1} />
          <StatCard icon={Stethoscope} label="Doctors on duty" value="42" sub="Live" color="var(--indigo)" delay={0.15} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Weekly patient analytics</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168,80%,36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(168,80%,36%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,160,0.06)" />
              <XAxis dataKey="day" stroke="#3d7060" fontSize={11} />
              <YAxis stroke="#3d7060" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <Area type="monotone" dataKey="patients" stroke="hsl(168,80%,36%)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="diagnosed" stroke="hsl(239,84%,67%)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>Key AI modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={f.path} className="glass glass-hover rounded-xl p-4 block group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}20` }}>
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{f.title}</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{f.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" style={{ color: f.color }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}