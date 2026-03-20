import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, Brain, Activity, ChevronDown } from 'lucide-react'

interface Patient {
  id: string
  name: string
  ward: string
  riskScore: number
  riskType: string
  shapFeatures: { name: string; value: number; impact: number }[]
  vitals: { hr: number; bp: string; temp: number; spo2: number; lactate: number }
}

const patients: Patient[] = [
  {
    id: 'C3841', name: 'Rahul Mehta', ward: 'ICU Bed 3', riskScore: 89,
    riskType: 'Sepsis onset',
    shapFeatures: [
      { name: 'Lactate level', value: 4.2, impact: 0.88 },
      { name: 'Heart rate', value: 118, impact: 0.72 },
      { name: 'Mean arterial pressure', value: 62, impact: 0.61 },
      { name: 'WBC count', value: 18.4, impact: 0.45 },
      { name: 'Temperature', value: 38.9, impact: 0.38 },
    ],
    vitals: { hr: 118, bp: '85/54', temp: 38.9, spo2: 93, lactate: 4.2 }
  },
  {
    id: 'A7723', name: 'Priya Iyer', ward: 'Ward 2B', riskScore: 72,
    riskType: 'Respiratory decline',
    shapFeatures: [
      { name: 'SpO2 trend (24h)', value: -4.1, impact: 0.76 },
      { name: 'Respiratory rate', value: 28, impact: 0.68 },
      { name: 'FiO2 requirement', value: 0.45, impact: 0.51 },
      { name: 'CXR opacity', value: 2.3, impact: 0.39 },
    ],
    vitals: { hr: 102, bp: '118/74', temp: 37.8, spo2: 91, lactate: 1.8 }
  },
]

export default function PredictiveRisk() {
  const [selected, setSelected] = useState<string | null>('C3841')
  const selectedPt = patients.find(p => p.id === selected)

  const riskColor = (score: number) =>
    score >= 70 ? '#D85A30' : score >= 40 ? '#BA7517' : '#1D9E75'

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(216,90,48,0.2)' }}>
            <Brain className="w-5 h-5" style={{ color: '#D85A30' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Predictive Risk Engine
            </h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              XGBoost + SHAP · 48-hour early warning · Federated learning
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'High-risk patients', value: '3', color: '#D85A30' },
          { label: 'Medium risk', value: '11', color: '#BA7517' },
          { label: 'Alerts fired today', value: '7', color: '#D85A30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="glass rounded-xl p-5">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient list */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
              Risk leaderboard
            </h2>
          </div>
          {patients.map((p) => (
            <div key={p.id}
              onClick={() => setSelected(p.id)}
              className="px-5 py-4 cursor-pointer transition-all"
              style={{
                borderBottom: '1px solid var(--border)',
                background: selected === p.id ? 'rgba(0,200,160,0.05)' : 'transparent',
                borderLeft: selected === p.id ? '3px solid var(--teal)' : '3px solid transparent',
              }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {p.name}
                    <span className="text-xs ml-2 font-mono" style={{ color: 'var(--text3)' }}>
                      #{p.id}
                    </span>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                    {p.ward} · {p.riskType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: riskColor(p.riskScore) }}>
                    {p.riskScore}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>risk score</p>
                </div>
              </div>
              {/* Mini risk bar */}
              <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${p.riskScore}%`, background: riskColor(p.riskScore) }} />
              </div>
            </div>
          ))}
        </div>

        {/* SHAP explanation */}
        {selectedPt && (
          <motion.div key={selectedPt.id} initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }} className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                SHAP feature importance — {selectedPt.name}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                Why the AI predicted {selectedPt.riskScore}% {selectedPt.riskType} risk
              </p>
            </div>
            <div className="p-5 space-y-4">
              {selectedPt.shapFeatures.map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--text2)' }}>{f.name}</span>
                    <span className="text-xs font-mono" style={{ color: riskColor(f.impact * 100) }}>
                      +{f.impact.toFixed(2)} SHAP
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${f.impact * 100}%` }}
                      transition={{ delay: 0.1 * i, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: riskColor(f.impact * 100) }} />
                  </div>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text3)' }}>
                    Current value: {f.value}
                  </p>
                </div>
              ))}
              {/* Vitals */}
              <div className="rounded-lg p-3 mt-2"
                style={{ background: 'rgba(216,90,48,0.05)', border: '1px solid rgba(216,90,48,0.2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#D85A30' }}>
                  Current vitals
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(selectedPt.vitals).map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{v}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>{k.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}