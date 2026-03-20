import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Droplets, Thermometer, Wifi, AlertTriangle } from 'lucide-react'

interface VitalReading {
  label: string
  value: string
  unit: string
  status: 'normal' | 'warning' | 'critical'
  percent: number
  source: string
}

export default function IoTWearables() {
  const [vitals, setVitals] = useState<VitalReading[]>([
    { label: 'Heart rate', value: '72', unit: 'bpm', status: 'normal', percent: 60, source: 'Apple Watch' },
    { label: 'SpO2', value: '98', unit: '%', status: 'normal', percent: 98, source: 'Pulse oximeter' },
    { label: 'Blood glucose', value: '142', unit: 'mg/dL', status: 'warning', percent: 71, source: 'Glucometer' },
    { label: 'Blood pressure', value: '118/76', unit: 'mmHg', status: 'normal', percent: 55, source: 'BP cuff' },
    { label: 'Temperature', value: '37.1', unit: '°C', status: 'normal', percent: 62, source: 'Patch sensor' },
    { label: 'Steps today', value: '3,180', unit: 'steps', status: 'warning', percent: 32, source: 'Apple Watch' },
  ])

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => prev.map(v => {
        if (v.label === 'Heart rate') {
          const newVal = 70 + Math.floor(Math.random() * 10)
          return { ...v, value: String(newVal), percent: Math.round((newVal / 120) * 100) }
        }
        return v
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const statusColor = (s: string) =>
    s === 'critical' ? '#D85A30' : s === 'warning' ? '#BA7517' : '#1D9E75'

  // ECG data simulation
  const ecgPoints = Array.from({ length: 50 }, (_, i) => {
    const x = i * 8
    const isQRS = i % 12 === 5
    const y = isQRS ? 10 : (i % 12 === 4 || i % 12 === 6) ? 22 : (i % 12 === 7) ? 30 : 20
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(29,158,117,0.2)' }}>
            <Activity className="w-5 h-5" style={{ color: 'var(--teal)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>IoT wearable hub</h1>
            <div className="flex items-center gap-2 mt-1">
              <Wifi className="w-3 h-3" style={{ color: 'var(--emerald)' }} />
              <span className="text-xs" style={{ color: 'var(--emerald)' }}>6 devices connected · Syncing live</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live vitals grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {vitals.map((v, i) => (
          <motion.div key={v.label} initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass glass-hover rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: statusColor(v.status) }} />
              <span className="text-xs" style={{ color: 'var(--text3)' }}>{v.source}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold" style={{ color: statusColor(v.status) }}>
                {v.value}
              </span>
              <span className="text-sm" style={{ color: 'var(--text3)' }}>{v.unit}</span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text2)' }}>{v.label}</p>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${v.percent}%`, background: statusColor(v.status) }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ECG strip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }} className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
          Live ECG strip <span className="text-xs font-normal ml-2" style={{ color: 'var(--emerald)' }}>
            Normal sinus rhythm · QTc 412ms
          </span>
        </h2>
        <div className="rounded-lg overflow-hidden p-2" style={{ background: 'var(--surface2)' }}>
          <svg width="100%" height="50" viewBox="0 400 50">
            <polyline fill="none" stroke="#1D9E75" strokeWidth="1.5" points={ecgPoints} />
          </svg>
        </div>
      </motion.div>

      {/* 7-day activity chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }} className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
          7-day activity trail
        </h2>
        <div className="space-y-2">
          {[
            { d: 'Mon', v: 8200 }, { d: 'Tue', v: 10400 }, { d: 'Wed', v: 9800 },
            { d: 'Thu', v: 7100 }, { d: 'Fri', v: 5200 }, { d: 'Sat', v: 4800 }, { d: 'Sun', v: 3100 },
          ].map((day) => (
            <div key={day.d} className="flex items-center gap-3">
              <span className="text-xs w-8" style={{ color: 'var(--text3)' }}>{day.d}</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(day.v / 12000 * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: day.v < 5000 ? '#BA7517' : '#1D9E75' }} />
              </div>
              <span className="text-xs font-mono" style={{ color: 'var(--text2)' }}>
                {day.v.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-lg"
          style={{ background: 'rgba(186,117,23,0.08)', border: '1px solid rgba(186,117,23,0.2)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#854F0B' }}>
            AI insight
          </p>
          <p className="text-xs" style={{ color: '#854F0B' }}>
            Activity declined 47% in last 3 days. Possible fatigue or illness onset.
            Heart rate variability also reduced. Recommend clinical check-in.
          </p>
        </div>
      </motion.div>
    </div>
  )
}