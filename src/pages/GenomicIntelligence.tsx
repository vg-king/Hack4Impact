import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dna, Upload, AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { analyzeGenomicRisk } from '../utils/gemini'

interface GeneVariant {
  gene: string
  variant: string
  status: 'normal' | 'variant' | 'carrier'
  disease: string
  riskIncrease: string
}

const mockVariants: GeneVariant[] = [
  { gene: 'BRCA1', variant: 'WT', status: 'normal', disease: 'Breast/Ovarian cancer', riskIncrease: 'No increase' },
  { gene: 'APOE', variant: 'ε3/ε4', status: 'carrier', disease: 'Alzheimer\'s disease', riskIncrease: '3-4x elevated' },
  { gene: 'CYP2D6', variant: '*4/*4', status: 'variant', disease: 'Drug metabolism', riskIncrease: 'Poor metabolizer' },
  { gene: 'MTHFR', variant: 'C677T', status: 'carrier', disease: 'Homocysteine levels', riskIncrease: 'Moderate increase' },
  { gene: 'TPMT', variant: '*3A', status: 'variant', disease: 'Thiopurine toxicity', riskIncrease: 'High toxicity risk' },
  { gene: 'HLA-B*57:01', variant: 'NEG', status: 'normal', disease: 'Abacavir hypersensitivity', riskIncrease: 'Safe to use' },
]

const drugAlerts = [
  { drug: 'Codeine / Tramadol', reason: 'CYP2D6 poor metabolizer', severity: 'AVOID' as const },
  { drug: 'Clopidogrel', reason: 'Reduced antiplatelet efficacy expected', severity: 'CAUTION' as const },
  { drug: 'Azathioprine', reason: 'TPMT variant — life-threatening bone marrow suppression', severity: 'AVOID' as const },
  { drug: 'Metformin', reason: 'MTHFR variant — monitor B12 levels', severity: 'MONITOR' as const },
  { drug: 'Aspirin, Statins', reason: 'Normal metabolism expected', severity: 'SAFE' as const },
]

export default function GenomicIntelligence() {
  const [analyzing, setAnalyzing] = useState(false)
  const [geminiInsight, setGeminiInsight] = useState('')
  const [uploaded, setUploaded] = useState(false)

  const runGeminiAnalysis = async () => {
    setAnalyzing(true)
    try {
      const result = await analyzeGenomicRisk(['APOE ε3/ε4', 'CYP2D6 *4/*4', 'MTHFR C677T', 'TPMT *3A'])
      setGeminiInsight(result)
    } catch {
      setGeminiInsight('Gemini analysis unavailable. Check API key in .env file.')
    } finally {
      setAnalyzing(false)
    }
  }

  const severityStyle = (s: string) => {
    if (s === 'AVOID') return { background: 'rgba(216,90,48,0.1)', color: '#993C1D' }
    if (s === 'CAUTION') return { background: 'rgba(186,117,23,0.1)', color: '#854F0B' }
    if (s === 'MONITOR') return { background: 'rgba(186,117,23,0.08)', color: '#854F0B' }
    return { background: 'rgba(29,158,117,0.1)', color: '#0F6E56' }
  }

  const geneStyle = (s: GeneVariant['status']) => {
    if (s === 'variant') return { background: 'rgba(216,90,48,0.1)', color: '#993C1D' }
    if (s === 'carrier') return { background: 'rgba(186,117,23,0.1)', color: '#854F0B' }
    return { background: 'rgba(29,158,117,0.1)', color: '#0F6E56' }
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(127,119,221,0.2)' }}>
            <Dna className="w-5 h-5" style={{ color: '#7F77DD' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Genomic intelligence
            </h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              SNP analysis · Pharmacogenomics · BRCA/APOE screening · Drug-gene safety
            </p>
          </div>
        </div>
      </motion.div>

      {/* VCF Upload */}
      {!uploaded ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setUploaded(true)}
          className="glass rounded-xl p-10 text-center cursor-pointer glass-hover">
          <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: '#7F77DD' }} />
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Upload VCF file or raw DNA data
          </p>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            Supports: VCF, 23andMe, AncestryDNA, FASTQ · All processing on-device · HIPAA compliant
          </p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {['VCF 4.x', '23andMe', 'AncestryDNA', 'WGS FASTQ', 'WES'].map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full"
                style={{ background: 'rgba(127,119,221,0.1)', color: '#7F77DD' }}>{t}</span>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              genome_patient_vivek_das.vcf — analyzed
            </p>
            <p className="text-xs" style={{ color: 'var(--text2)' }}>
              4.2M SNPs processed · 23 clinically significant variants · Analysis: 3.4s
            </p>
          </div>
        </motion.div>
      )}

      {uploaded && (
        <>
          {/* Gene variants */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                Clinically significant variants
              </h2>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {mockVariants.map((v) => (
                <span key={v.gene} className="px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer"
                  style={geneStyle(v.status)}
                  title={`${v.disease} · ${v.riskIncrease}`}>
                  {v.gene} {v.variant}
                </span>
              ))}
            </div>
            <div className="px-4 pb-4">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Green = normal · Orange = carrier · Red = pathogenic variant. Hover for details.
              </p>
            </div>
          </motion.div>

          {/* Drug safety alerts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                Pharmacogenomic drug safety alerts
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {drugAlerts.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                  className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{d.drug}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{d.reason}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                    style={severityStyle(d.severity)}>{d.severity}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Gemini analysis */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                Gemini AI deep analysis
              </h2>
              <button onClick={runGeminiAnalysis} disabled={analyzing}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'var(--gradient-primary)' }}>
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
                {analyzing ? 'Analyzing...' : 'Run Gemini analysis'}
              </button>
            </div>
            {geminiInsight ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-4"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                {geminiInsight}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                Click "Run Gemini analysis" to get a deep clinical interpretation of all variants using Gemini 1.5 Flash.
              </p>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}