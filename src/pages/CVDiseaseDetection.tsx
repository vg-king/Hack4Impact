import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle, Eye, Scan } from 'lucide-react'
import { detectDiseaseFromImage } from '../utils/gemini'

type Category = 'skin' | 'eye' | 'hair' | 'face' | 'chest-xray' | 'wound' | 'general'

interface Detection {
  condition: string
  icd10: string
  confidence: number
  severity: number
  location: string
  bbox_percent: number[]
  details: string
  action: string
  referral: string
  differentials: string[]
}

interface CVResult {
  detections: Detection[]
  overall_risk: string
  urgent: boolean
  summary: string
}

const categories: { id: Category; label: string; desc: string; color: string; examples: string[] }[] = [
  { id: 'skin', label: 'Skin analysis', desc: 'Lesions, rashes, melanoma, psoriasis, eczema, acne', color: '#f472b6',
    examples: ['Melanoma', 'Psoriasis', 'Eczema', 'Acne', 'Rosacea', 'Vitiligo', 'Ringworm'] },
  { id: 'eye', label: 'Eye disorders', desc: 'Diabetic retinopathy, glaucoma, cataract, conjunctivitis', color: '#60a5fa',
    examples: ['Diabetic retinopathy', 'Glaucoma', 'Cataract', 'Conjunctivitis'] },
  { id: 'hair', label: 'Hair & scalp', desc: 'Baldness grading, alopecia, dandruff, tinea capitis', color: '#fb923c',
    examples: ['Androgenic alopecia', 'Alopecia areata', 'Dandruff', 'Scalp psoriasis'] },
  { id: 'face', label: 'Facial analysis', desc: 'Jaundice, cyanosis, pallor, facial palsy, systemic signs', color: '#a78bfa',
    examples: ['Jaundice', 'Cyanosis', 'Facial palsy', 'Anaemia signs'] },
  { id: 'chest-xray', label: 'Chest X-ray', desc: 'Pneumonia, TB, nodules, cardiomegaly, effusion', color: '#34d399',
    examples: ['Pneumonia', 'Tuberculosis', 'Pleural effusion', 'Cardiomegaly'] },
  { id: 'wound', label: 'Wound assessment', desc: 'Infection grade, burns degree, diabetic ulcer, pressure sore', color: '#f87171',
    examples: ['Infected wound', 'Burns grading', 'Diabetic ulcer', 'Pressure sore'] },
  { id: 'general', label: 'General body scan', desc: 'Any body part — AI detects all visible abnormalities', color: 'var(--teal)',
    examples: ['Any visible condition', 'Multiple findings', 'Unknown symptom'] },
]

const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res((r.result as string).split(',')[1]); r.onerror = rej; r.readAsDataURL(file)
  })

const riskColor = (risk: string) =>
  risk === 'critical' ? '#D85A30' : risk === 'high' ? '#D85A30' : risk === 'medium' ? '#BA7517' : '#1D9E75'

const sevColor = (s: number) => s >= 70 ? '#D85A30' : s >= 40 ? '#BA7517' : '#1D9E75'

export default function CVDiseaseDetection() {
  const [selectedCat, setSelectedCat] = useState<Category>('skin')
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<CVResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawBBoxes = (detections: Detection[], imgEl: HTMLImageElement) => {
    const cv = canvasRef.current; if (!cv) return
    cv.width = imgEl.naturalWidth; cv.height = imgEl.naturalHeight
    const ctx = cv.getContext('2d')!
    ctx.drawImage(imgEl, 0, 0)
    detections.forEach(d => {
      if (!d.bbox_percent || d.bbox_percent.length < 4) return
      const [x1p, y1p, x2p, y2p] = d.bbox_percent
      const x1 = (x1p / 100) * cv.width, y1 = (y1p / 100) * cv.height
      const w = ((x2p - x1p) / 100) * cv.width, h = ((y2p - y1p) / 100) * cv.height
      const col = sevColor(d.severity)
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([6, 3])
      ctx.strokeRect(x1, y1, w, h); ctx.setLineDash([])
      ctx.fillStyle = col + '33'; ctx.fillRect(x1, y1, w, h)
      const label = `${d.condition} ${d.confidence}%`
      ctx.font = 'bold 13px Sora, sans-serif'
      const tw = ctx.measureText(label).width
      ctx.fillStyle = col; ctx.fillRect(x1, y1 - 20, tw + 10, 20)
      ctx.fillStyle = 'white'; ctx.fillText(label, x1 + 5, y1 - 5)
    })
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setErrMsg('Please upload an image file (JPG, PNG, WEBP).'); return }
    setStatus('analyzing'); setResult(null); setErrMsg('')
    const url = URL.createObjectURL(file); setPreviewUrl(url)
    try {
      const b64 = await toBase64(file)
      const raw = await detectDiseaseFromImage(b64, file.type, selectedCat)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed: CVResult = JSON.parse(clean)
      setResult(parsed); setStatus('done')
      // Draw bboxes after image loads
      const img = new Image(); img.onload = () => drawBBoxes(parsed.detections, img); img.src = url
    } catch {
      setStatus('error'); setErrMsg('Analysis failed. Ensure VITE_GEMINI_API_KEY is set in .env. Try a clearer image.')
    }
  }, [selectedCat])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,114,182,0.2)' }}>
            <Camera className="w-5 h-5" style={{ color: '#f472b6' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>CV Disease Detection</h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              YOLOv8 + OpenCV + Gemini Vision · 20+ conditions · Bounding box localization · ICD-10 coding
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <motion.div key={cat.id} whileHover={{ y: -2 }}
            onClick={() => setSelectedCat(cat.id)}
            className="rounded-xl p-3 cursor-pointer transition-all"
            style={{
              background: selectedCat === cat.id ? `${cat.color}15` : 'var(--surface)',
              border: `1.5px solid ${selectedCat === cat.id ? cat.color : 'var(--border)'}`,
            }}>
            <Scan className="w-5 h-5 mb-2" style={{ color: cat.color }} />
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>{cat.label}</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--text2)' }}>{cat.desc}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {cat.examples.slice(0, 2).map(e => (
                <span key={e} className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${cat.color}15`, color: cat.color }}>{e}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
        className="rounded-2xl p-10 text-center cursor-pointer transition-all"
        style={{ border: '2px dashed var(--border)', background: 'var(--surface)' }}
        onClick={() => document.getElementById('cv-file-in')?.click()}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(244,114,182,0.12)' }}>
          {status === 'analyzing' ? <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#f472b6' }} /> : <Upload className="w-7 h-7" style={{ color: '#f472b6' }} />}
        </div>
        <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
          {status === 'analyzing' ? `Analyzing ${selectedCat} image with Gemini Vision...` : `Upload ${categories.find(c=>c.id===selectedCat)?.label} image`}
        </p>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>
          Drop image or click · YOLO bounding boxes drawn automatically
        </p>
        <input id="cv-file-in" type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </motion.div>

      {/* Error */}
      {errMsg && (
        <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(216,90,48,0.06)', border: '1px solid rgba(216,90,48,0.25)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D85A30' }} />
          <p className="text-sm" style={{ color: '#D85A30' }}>{errMsg}</p>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Annotated image */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Annotated image</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${riskColor(result.overall_risk)}15`, color: riskColor(result.overall_risk) }}>
                {result.overall_risk} risk
              </span>
              {result.urgent && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(216,90,48,0.15)', color: '#D85A30' }}>
                  URGENT
                </span>
              )}
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <canvas ref={canvasRef} className="w-full" style={{ display: result ? 'block' : 'none' }} />
            </div>
            <div className="glass rounded-xl p-3 mt-3">
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>AI summary</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>{result.summary}</p>
            </div>
          </div>

          {/* Detections list */}
          <div>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>
              {result.detections.length} detection{result.detections.length !== 1 ? 's' : ''}
            </h2>
            <div className="space-y-3">
              {result.detections.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: `${sevColor(d.severity)}06` }}>
                    <Eye className="w-4 h-4 flex-shrink-0" style={{ color: sevColor(d.severity) }} />
                    <div className="flex-1">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{d.condition}</span>
                      <span className="text-xs ml-2 font-mono" style={{ color: 'var(--text3)' }}>{d.icd10}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{ background: `${sevColor(d.severity)}15`, color: sevColor(d.severity) }}>
                      {d.confidence}%
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text3)' }}>Severity</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${d.severity}%`, background: sevColor(d.severity) }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: sevColor(d.severity) }}>{d.severity}/100</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{d.details}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(29,158,117,0.1)', color: '#0F6E56' }}>
                        Action: {d.action}
                      </span>
                      {d.referral && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(52,139,212,0.1)', color: '#185FA5' }}>
                          Refer: {d.referral}
                        </span>
                      )}
                    </div>
                    {d.differentials?.length > 0 && (
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>
                        Differentials: {d.differentials.join(' · ')}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Capabilities */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>Detection capabilities</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Skin diseases', items: 'Melanoma · Psoriasis · Eczema · Acne · Rosacea · Vitiligo · Ringworm · Seborrheic dermatitis' },
            { title: 'Eye disorders', items: 'Diabetic retinopathy · Glaucoma · Cataract · Macular degeneration · Conjunctivitis · Pterygium' },
            { title: 'Hair & scalp', items: 'Pattern baldness (Norwood grade) · Alopecia areata · Dandruff · Scalp psoriasis · Telogen effluvium' },
            { title: 'Facial systemic signs', items: 'Jaundice · Cyanosis · Anaemia · Facial palsy · Cushingoid · Acromegaly · Thyroid eye disease' },
            { title: 'Chest X-ray', items: 'Pneumonia · TB · Pneumothorax · Cardiomegaly · Pleural effusion · Lung nodules · Atelectasis' },
            { title: 'Wounds', items: 'Infected wound · Burns grading · Diabetic ulcer · Pressure sore · Cellulitis · Abscess' },
          ].map((cat) => (
            <div key={cat.title} className="rounded-lg p-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>{cat.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{cat.items}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}