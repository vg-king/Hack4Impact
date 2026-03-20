import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, Upload, CheckCircle, AlertCircle, Loader2, Camera, AlertTriangle } from 'lucide-react'
import { analyzePrescriptionImage } from '../utils/gemini'

interface Drug {
  name: string
  dose: string
  frequency: string
  duration: string
  instructions: string
  warnings: string[]
  severity: 'low' | 'medium' | 'high'
}

interface ParsedRx {
  doctor: string
  date: string
  drugs: Drug[]
  diagnosis: string
  confidence: number
  flags: string[]
}

const sevColor = (s: string) =>
  s === 'high' ? '#D85A30' : s === 'medium' ? '#BA7517' : '#1D9E75'

const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res((r.result as string).split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })

export default function PrescriptionOCR() {
  const [status, setStatus] = useState<'idle' | 'reading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<ParsedRx | null>(null)
  const [rawText, setRawText] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrMsg('Please upload an image (JPG, PNG) or PDF of the prescription.')
      return
    }
    setStatus('reading')
    setResult(null)
    setRawText('')
    setErrMsg('')
    setPreviewUrl(URL.createObjectURL(file))
    try {
      const b64 = await toBase64(file)
      const raw = await analyzePrescriptionImage(b64, file.type)
      setRawText(raw)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed: ParsedRx = JSON.parse(clean)
      setResult(parsed)
      setStatus('done')
    } catch (e) {
      setStatus('error')
      setErrMsg('Could not parse prescription. Tip: Check VITE_GEMINI_API_KEY in .env. Raw response stored.')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.2)' }}>
            <ScrollText className="w-5 h-5" style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Prescription OCR</h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Reads ANY handwriting · Doctor scrawl · Faded paper · Mixed cursive · Powered by Gemini Vision
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
        className="rounded-2xl p-10 text-center cursor-pointer transition-all"
        style={{ border: '2px dashed var(--border)', background: 'var(--surface)' }}
        onClick={() => document.getElementById('rx-input')?.click()}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(167,139,250,0.15)' }}>
          {status === 'reading' ? <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#a78bfa' }} /> : <Upload className="w-7 h-7" style={{ color: '#a78bfa' }} />}
        </div>
        <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
          {status === 'reading' ? 'Reading prescription with Gemini Vision...' : 'Drop prescription photo here'}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
          JPG, PNG, PDF · Phone camera photo works perfectly · Any handwriting style
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {['Messy scrawl', 'Faded paper', 'Cursive', 'Mixed print', 'Old paper', 'Phone photo'].map(t => (
            <span key={t} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>{t}</span>
          ))}
        </div>
        <input id="rx-input" type="file" accept="image/*,.pdf" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </motion.div>

      {/* Error */}
      {errMsg && (
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(216,90,48,0.08)', border: '1px solid rgba(216,90,48,0.3)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D85A30' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#D85A30' }}>{errMsg}</p>
            {rawText && <details className="mt-2"><summary className="text-xs cursor-pointer" style={{ color: 'var(--text3)' }}>Show raw Gemini response</summary>
              <pre className="text-xs mt-2 whitespace-pre-wrap" style={{ color: 'var(--text2)' }}>{rawText}</pre>
            </details>}
          </div>
        </div>
      )}

      {/* Preview + Results */}
      {previewUrl && status === 'done' && result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image preview */}
          <div>
            <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>Uploaded prescription</h2>
            <div className="glass rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Prescription" className="w-full object-contain max-h-64" />
              <div className="p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--emerald)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--emerald)' }}>OCR confidence: {result.confidence}%</span>
                <div className="flex-1 h-1.5 rounded-full ml-2" style={{ background: 'var(--surface2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${result.confidence}%`, background: result.confidence >= 85 ? 'var(--emerald)' : result.confidence >= 70 ? 'var(--amber)' : 'var(--coral)' }} />
                </div>
              </div>
            </div>
            {result.doctor && (
              <div className="glass rounded-xl p-4 mt-4 space-y-2">
                {result.doctor && <div className="flex justify-between text-xs"><span style={{ color: 'var(--text2)' }}>Doctor</span><span style={{ color: 'var(--text)' }}>{result.doctor}</span></div>}
                {result.date && <div className="flex justify-between text-xs"><span style={{ color: 'var(--text2)' }}>Date</span><span style={{ color: 'var(--text)' }}>{result.date}</span></div>}
                {result.diagnosis && <div className="flex justify-between text-xs"><span style={{ color: 'var(--text2)' }}>Diagnosis</span><span style={{ color: 'var(--text)' }}>{result.diagnosis}</span></div>}
              </div>
            )}
          </div>

          {/* Parsed drugs */}
          <div>
            <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>
              {result.drugs.length} drug{result.drugs.length !== 1 ? 's' : ''} identified
            </h2>
            <div className="space-y-3">
              {result.drugs.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: `${sevColor(d.severity)}08` }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: sevColor(d.severity) }}>{i + 1}</div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{d.name}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${sevColor(d.severity)}20`, color: sevColor(d.severity) }}>{d.severity}</span>
                  </div>
                  <div className="px-4 py-3 space-y-1">
                    <p className="text-xs" style={{ color: 'var(--text2)' }}><span style={{ color: 'var(--text3)' }}>Dose: </span>{d.dose} · {d.frequency} · {d.duration}</p>
                    {d.instructions && <p className="text-xs" style={{ color: 'var(--text2)' }}><span style={{ color: 'var(--text3)' }}>Instructions: </span>{d.instructions}</p>}
                    {d.warnings?.map((w, j) => (
                      <p key={j} className="text-xs flex items-center gap-1.5" style={{ color: '#BA7517' }}>
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />{w}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {result.flags?.length > 0 && (
              <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(216,90,48,0.06)', border: '1px solid rgba(216,90,48,0.25)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#D85A30' }}>Safety flags</p>
                {result.flags.map((f, i) => <p key={i} className="text-xs mb-1" style={{ color: '#D85A30' }}>• {f}</p>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>How it works</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Upload photo', desc: 'Any prescription — handwritten, typed, faded, torn' },
            { step: '2', title: 'Gemini Vision OCR', desc: 'Reads even the messiest doctor handwriting using medical context' },
            { step: '3', title: 'Drug parsing', desc: 'Extracts drug name, dose, frequency, duration, instructions' },
            { step: '4', title: 'Safety check', desc: 'Flags interactions, allergy risks, and unclear dosages' },
          ].map((s) => (
            <div key={s.step} className="space-y-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>{s.step}</div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{s.title}</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}