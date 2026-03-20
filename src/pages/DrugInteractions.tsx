import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pill, Plus, X, AlertTriangle, Loader2, Brain } from 'lucide-react'
import { checkDrugInteractions } from '../utils/gemini'

const commonDrugs = [
  'Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg', 'Aspirin 75mg',
  'Amlodipine 5mg', 'Omeprazole 20mg', 'Clopidogrel 75mg', 'Warfarin 5mg',
  'Ciprofloxacin 500mg', 'Amoxicillin 500mg', 'Azithromycin 500mg', 'Metoprolol 50mg',
]

const mockInteractions = [
  { pair: 'Metformin + Lisinopril', severity: 'moderate', desc: 'May enhance hypoglycaemic effect. Monitor blood glucose closely.' },
  { pair: 'Warfarin + Aspirin', severity: 'high', desc: 'Significantly increased bleeding risk. Avoid combination or monitor INR frequently.' },
  { pair: 'Clopidogrel + Omeprazole', severity: 'moderate', desc: 'Omeprazole reduces clopidogrel efficacy via CYP2C19 inhibition. Consider pantoprazole.' },
  { pair: 'Atorvastatin + Amlodipine', severity: 'low', desc: 'Amlodipine slightly increases atorvastatin exposure. Max 40mg atorvastatin.' },
]

export default function DrugInteractions() {
  const [selectedDrugs, setSelectedDrugs] = useState(['Metformin 500mg', 'Lisinopril 10mg'])
  const [geminiResult, setGeminiResult] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleDrug = (drug: string) => {
    setSelectedDrugs(prev =>
      prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
    )
    setGeminiResult('')
  }

  const runCheck = async () => {
    if (selectedDrugs.length < 2) return
    setLoading(true)
    try {
      const result = await checkDrugInteractions(selectedDrugs)
      setGeminiResult(result)
    } catch {
      setGeminiResult('Check your VITE_GEMINI_API_KEY in the .env file.')
    } finally {
      setLoading(false)
    }
  }

  const sevColor = (s: string) =>
    s === 'high' ? '#D85A30' : s === 'moderate' ? '#BA7517' : '#1D9E75'

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(186,117,23,0.2)' }}>
            <Pill className="w-5 h-5" style={{ color: 'var(--amber)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Drug interaction AI
            </h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Multi-drug safety · Dosage optimizer · Pregnancy contraindications · Powered by Gemini
            </p>
          </div>
        </div>
      </motion.div>

      {/* Drug selector */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
          Select drugs to check ({selectedDrugs.length} selected)
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {commonDrugs.map(drug => (
            <button key={drug} onClick={() => toggleDrug(drug)}
              className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
              style={{
                background: selectedDrugs.includes(drug) ? '#1D9E75' : 'var(--surface2)',
                color: selectedDrugs.includes(drug) ? 'white' : 'var(--text2)',
                border: `1px solid ${selectedDrugs.includes(drug) ? '#1D9E75' : 'var(--border)'}`,
              }}>
              {drug}
            </button>
          ))}
        </div>
        <button onClick={runCheck} disabled={loading || selectedDrugs.length < 2}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white disabled:opacity-40"
          style={{ background: 'var(--gradient-primary)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {loading ? 'Checking interactions...' : 'Check with Gemini AI'}
        </button>
      </div>

      {/* Mock interactions (always shown) */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
            Known interactions database
          </h2>
        </div>
        {mockInteractions.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="px-5 py-3 flex items-start gap-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: sevColor(m.severity) }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.pair}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{m.desc}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full capitalize flex-shrink-0"
              style={{ background: `${sevColor(m.severity)}20`, color: sevColor(m.severity) }}>
              {m.severity}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Gemini result */}
      {geminiResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Gemini AI interaction report
          </h2>
          <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-4"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
            {geminiResult}
          </div>
        </motion.div>
      )}
    </div>
  )
}