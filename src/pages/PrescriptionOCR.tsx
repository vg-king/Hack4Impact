import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ScrollText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Save,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react'
import { analyzeHealthJourneyWithClaude, analyzePrescriptionImage } from '../utils/gemini'

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

interface TimelineEntry {
  id: number
  date: string
  patientName: string
  drugs: Drug[]
  rawText: string
}

type FamilyRelation = 'Father' | 'Mother' | 'Grandfather' | 'Grandmother' | 'Spouse' | 'Child' | 'Other' | 'Self'

interface FamilyProfile {
  id: string
  name: string
  relation: FamilyRelation
}

const TIMELINE_KEY = 'prescriptionTimeline'
const FAMILY_KEY = 'familyProfiles'
const ACTIVE_FAMILY_KEY = 'activeFamilyProfileId'

const todayDate = () => new Date().toISOString().split('T')[0]

const readTimeline = (): TimelineEntry[] => {
  try {
    const raw = localStorage.getItem(TIMELINE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeTimeline = (entries: TimelineEntry[]) => {
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(entries))
}

const defaultProfile: FamilyProfile = {
  id: 'myself-default',
  name: 'Myself',
  relation: 'Self',
}

const readFamilyProfiles = (): FamilyProfile[] => {
  try {
    const raw = localStorage.getItem(FAMILY_KEY)
    if (!raw) return [defaultProfile]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [defaultProfile]
    const valid = parsed.filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.relation === 'string')
    const hasMyself = valid.some((p) => p.id === defaultProfile.id)
    return hasMyself ? valid : [defaultProfile, ...valid]
  } catch {
    return [defaultProfile]
  }
}

const writeFamilyProfiles = (profiles: FamilyProfile[]) => {
  localStorage.setItem(FAMILY_KEY, JSON.stringify(profiles))
}

const sevColor = (s: string) => (s === 'high' ? '#D85A30' : s === 'medium' ? '#BA7517' : '#1D9E75')

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

  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveDate, setSaveDate] = useState(todayDate())
  const [toastMsg, setToastMsg] = useState('')

  const [timelineOpen, setTimelineOpen] = useState(false)
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [journeyInsights, setJourneyInsights] = useState('')
  const [journeyError, setJourneyError] = useState('')

  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([defaultProfile])
  const [activeProfileId, setActiveProfileId] = useState(defaultProfile.id)
  const [addProfileOpen, setAddProfileOpen] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileRelation, setNewProfileRelation] = useState<FamilyRelation>('Father')

  const activeProfile = useMemo(
    () => familyProfiles.find((p) => p.id === activeProfileId) || defaultProfile,
    [activeProfileId, familyProfiles],
  )

  useEffect(() => {
    const profiles = readFamilyProfiles()
    setFamilyProfiles(profiles)
    const savedActiveId = localStorage.getItem(ACTIVE_FAMILY_KEY)
    const validActive = savedActiveId && profiles.some((p) => p.id === savedActiveId) ? savedActiveId : defaultProfile.id
    setActiveProfileId(validActive)
  }, [])

  useEffect(() => {
    localStorage.setItem(ACTIVE_FAMILY_KEY, activeProfileId)
  }, [activeProfileId])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg(''), 2500)
  }

  const refreshTimeline = () => {
    const entries = readTimeline().sort((a, b) => a.date.localeCompare(b.date))
    const scoped = entries.filter((entry) => entry.patientName === activeProfile.name)
    setTimelineEntries(scoped)
    return scoped
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrMsg('Please upload an image (JPG, PNG) or PDF of the prescription.')
      return
    }
    setStatus('reading')
    setResult(null)
    setRawText('')
    setErrMsg('')
    setJourneyInsights('')
    setJourneyError('')
    setPreviewUrl(URL.createObjectURL(file))
    try {
      const b64 = await toBase64(file)
      const raw = await analyzePrescriptionImage(b64, file.type)
      setRawText(raw)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed: ParsedRx = JSON.parse(clean)
      setResult(parsed)
      setStatus('done')
    } catch {
      setStatus('error')
      setErrMsg('Could not parse prescription. Tip: Check VITE_GEMINI_API_KEY in .env. Raw response stored.')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const saveToTimeline = () => {
    if (!result) return

    const entry: TimelineEntry = {
      id: Date.now(),
      date: saveDate,
      patientName: activeProfile.name,
      drugs: result.drugs,
      rawText,
    }

    const updated = [...readTimeline(), entry].sort((a, b) => a.date.localeCompare(b.date))
    writeTimeline(updated)
    setTimelineEntries(updated.filter((item) => item.patientName === activeProfile.name))
    setShowSaveForm(false)
    setSaveDate(todayDate())
    showToast('Saved to your Health Timeline')
  }

  const toggleTimeline = () => {
    refreshTimeline()
    setTimelineOpen((prev) => !prev)
    setJourneyError('')
    setJourneyInsights('')
  }

  const removeTimelineEntry = (id: number) => {
    const updated = readTimeline().filter((entry) => entry.id !== id)
    writeTimeline(updated)
    setTimelineEntries(updated.filter((entry) => entry.patientName === activeProfile.name))
  }

  const addFamilyProfile = () => {
    const cleanName = newProfileName.trim()
    if (!cleanName) {
      showToast('Please enter family member name')
      return
    }
    if (familyProfiles.some((profile) => profile.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast('Profile with this name already exists')
      return
    }

    const profile: FamilyProfile = {
      id: `profile-${Date.now()}`,
      name: cleanName,
      relation: newProfileRelation,
    }

    const updated = [...familyProfiles, profile]
    setFamilyProfiles(updated)
    writeFamilyProfiles(updated)
    setActiveProfileId(profile.id)
    setNewProfileName('')
    setNewProfileRelation('Father')
    setAddProfileOpen(false)
    showToast('Family profile added')
  }

  const removeFamilyProfile = (profileId: string) => {
    if (profileId === defaultProfile.id) return
    const updated = familyProfiles.filter((profile) => profile.id !== profileId)
    setFamilyProfiles(updated)
    writeFamilyProfiles(updated)

    if (activeProfileId === profileId) {
      setActiveProfileId(defaultProfile.id)
    }

    showToast('Family profile removed')
  }

  const analyzeJourney = async () => {
    if (timelineEntries.length < 2) return

    const sorted = [...timelineEntries].sort((a, b) => a.date.localeCompare(b.date))
    const historyText = sorted
      .map((entry) => {
        const drugsWithDose = entry.drugs
          .map((drug) => `${drug.name}${drug.dose ? ` (${drug.dose})` : ''}`)
          .join(', ')

        return `Date: ${entry.date} | Drugs: ${drugsWithDose || 'No drugs captured'}`
      })
      .join('\n')

    const prompt = `You are a medical AI assistant. A patient has shared their prescription history over time. Analyze the progression and provide insights.

Prescription History (oldest to newest):
${historyText}
Please analyze:
1. Which medications were added over time
2. Which medications were removed
3. Any dose changes you notice
4. Overall health trend (improving / stable / worsening)
5. One important flag or concern if any
6. One recommendation (always end with: consult your doctor for medical decisions)

Keep response concise, in simple English, patient-friendly.`

    setInsightsLoading(true)
    setJourneyError('')
    setJourneyInsights('')

    try {
      const response = await analyzeHealthJourneyWithClaude(prompt)
      setJourneyInsights(response)
    } catch {
      setJourneyError('Could not analyze journey right now. Check VITE_CLAUDE_API_KEY in .env.')
    } finally {
      setInsightsLoading(false)
    }
  }

  const weeklyEntries = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(now.getDate() - 7)

    return timelineEntries.filter((entry) => {
      const d = new Date(entry.date)
      return !Number.isNaN(d.getTime()) && d >= sevenDaysAgo && d <= now
    })
  }, [timelineEntries])

  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState('')
  const [weeklyError, setWeeklyError] = useState('')

  const generateWeeklySummary = async () => {
    if (weeklyEntries.length === 0) return
    const weeklyDrugs = weeklyEntries
      .map((entry) => {
        const drugs = entry.drugs.map((drug) => `${drug.name}${drug.dose ? ` (${drug.dose})` : ''}`).join(', ')
        return `${entry.date}: ${drugs || 'No drugs captured'}`
      })
      .join('\n')

    const prompt = `You are a caring medical AI. Generate a warm, simple weekly health summary for a family caregiver.

Patient: ${activeProfile.name} (${activeProfile.relation})
This week's prescriptions: ${weeklyDrugs}

Generate:
1. A brief summary of medications this week (2-3 sentences, simple language)
2. Any refill reminders (if a prescription was from 25+ days ago, flag it)
3. One caring tip for the caregiver
4. End with: 'Remember to consult the doctor for any concerns.'

Tone: warm, simple, like a helpful friend — not clinical.`

    setWeeklyLoading(true)
    setWeeklySummary('')
    setWeeklyError('')
    try {
      const response = await analyzeHealthJourneyWithClaude(prompt)
      setWeeklySummary(response)
    } catch {
      setWeeklyError('Could not generate weekly summary right now. Check VITE_CLAUDE_API_KEY in .env.')
    } finally {
      setWeeklyLoading(false)
    }
  }

  useEffect(() => {
    refreshTimeline()
    setJourneyInsights('')
    setJourneyError('')
    setWeeklySummary('')
    setWeeklyError('')
  }, [activeProfileId])

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      {toastMsg && (
        <div
          className="fixed top-20 right-4 z-50 rounded-lg px-4 py-2 text-sm font-semibold"
          style={{ background: 'rgba(29,158,117,0.2)', border: '1px solid rgba(29,158,117,0.45)', color: 'var(--emerald)' }}
        >
          {toastMsg}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.2)' }}>
            <ScrollText className="w-5 h-5" style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Prescription OCR</h1>
            <p className="text-sm" style={{ color: '#a9ffe8' }}>
              Scanning for: {activeProfile.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Reads ANY handwriting · Doctor scrawl · Faded paper · Mixed cursive · Powered by Gemini Vision
            </p>
          </div>
        </div>
      </motion.div>

      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Scanning for:</p>
          <button
            onClick={() => setAddProfileOpen((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            style={{ background: 'rgba(29,158,117,0.16)', color: 'var(--emerald)', border: '1px solid rgba(29,158,117,0.35)' }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Add Family Member
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {familyProfiles.map((profile) => {
            const active = profile.id === activeProfileId
            return (
              <button
                key={profile.id}
                onClick={() => setActiveProfileId(profile.id)}
                className="px-3 py-1.5 rounded-full text-xs flex items-center gap-2"
                style={{
                  background: active ? 'rgba(29,158,117,0.22)' : 'rgba(12,34,46,0.8)',
                  color: active ? '#b8ffe8' : 'var(--text2)',
                  border: active ? '1px solid rgba(101,255,215,0.45)' : '1px solid var(--border)',
                }}
              >
                <span className="font-semibold">{profile.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>{profile.relation}</span>
                {profile.id !== defaultProfile.id && (
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFamilyProfile(profile.id)
                    }}
                    className="inline-flex items-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {addProfileOpen && (
          <div className="rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Family member name"
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'rgba(8, 30, 38, 0.86)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
            <select
              value={newProfileRelation}
              onChange={(e) => setNewProfileRelation(e.target.value as FamilyRelation)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: 'rgba(8, 30, 38, 0.86)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              {['Father', 'Mother', 'Grandfather', 'Grandmother', 'Spouse', 'Child', 'Other'].map((relation) => (
                <option key={relation} value={relation}>{relation}</option>
              ))}
            </select>
            <button
              onClick={addFamilyProfile}
              className="rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ background: 'var(--gradient-primary)', color: '#fff' }}
            >
              Save Profile
            </button>
          </div>
        )}
      </div>

      {weeklyEntries.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(180, 126, 32, 0.08)', border: '1px solid rgba(244, 176, 79, 0.4)' }}>
          <p className="text-sm font-semibold" style={{ color: '#ffd58b' }}>
            This Week&apos;s Health Summary for {activeProfile.name}
          </p>
          <div className="mt-2 space-y-1">
            {weeklyEntries.map((entry) => (
              <p key={entry.id} className="text-xs" style={{ color: '#f4d49a' }}>
                {entry.date}: {entry.drugs.map((drug) => drug.name).join(', ') || 'No drugs captured'}
              </p>
            ))}
          </div>

          <button
            onClick={generateWeeklySummary}
            disabled={weeklyLoading}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'rgba(244, 176, 79, 0.2)', border: '1px solid rgba(244,176,79,0.45)', color: '#ffd58b' }}
          >
            {weeklyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate AI Summary
          </button>

          {weeklyError && <p className="text-xs mt-2" style={{ color: '#f1b56a' }}>{weeklyError}</p>}

          {weeklySummary && (
            <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(100, 66, 16, 0.28)', border: '1px solid rgba(244,176,79,0.35)' }}>
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#ffe6b7' }}>{weeklySummary}</p>
            </div>
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-2xl p-10 text-center cursor-pointer transition-all"
        style={{ border: '2px dashed var(--border)', background: 'var(--surface)' }}
        onClick={() => document.getElementById('rx-input')?.click()}
      >
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
          {['Messy scrawl', 'Faded paper', 'Cursive', 'Mixed print', 'Old paper', 'Phone photo'].map((t) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>{t}</span>
          ))}
        </div>
        <input id="rx-input" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </motion.div>

      {errMsg && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(216,90,48,0.08)', border: '1px solid rgba(216,90,48,0.3)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D85A30' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#D85A30' }}>{errMsg}</p>
            {rawText && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer" style={{ color: 'var(--text3)' }}>Show raw Gemini response</summary>
                <pre className="text-xs mt-2 whitespace-pre-wrap" style={{ color: 'var(--text2)' }}>{rawText}</pre>
              </details>
            )}
          </div>
        </div>
      )}

      {previewUrl && status === 'done' && result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div>
            <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>
              {result.drugs.length} drug{result.drugs.length !== 1 ? 's' : ''} identified
            </h2>
            <div className="space-y-3">
              {result.drugs.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-xl overflow-hidden">
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

      {status === 'done' && result && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-4">
            <button
              onClick={() => setShowSaveForm((prev) => !prev)}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ background: 'var(--gradient-primary)', color: '#fff' }}
            >
              <Save className="w-4 h-4" />
              Save to My Health Timeline
            </button>

            {showSaveForm && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text2)' }}>Date of this prescription</label>
                  <input
                    type="date"
                    value={saveDate}
                    onChange={(e) => setSaveDate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={saveToTimeline}
                    className="w-full rounded-lg px-3 py-2 text-sm font-semibold"
                    style={{ background: 'rgba(29,158,117,0.2)', color: 'var(--emerald)', border: '1px solid rgba(29,158,117,0.4)' }}
                  >
                    Confirm Save
                  </button>
                </div>
                <p className="text-xs md:col-span-2" style={{ color: 'var(--text3)' }}>
                  Saving for active profile: {activeProfile.name}
                </p>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4">
            <button onClick={toggleTimeline} className="w-full flex items-center justify-between text-left">
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>My Health Timeline</span>
              {timelineOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text2)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text2)' }} />}
            </button>

            {timelineOpen && (
              <div className="mt-4 space-y-4">
                {timelineEntries.length >= 2 && (
                  <button
                    onClick={analyzeJourney}
                    disabled={insightsLoading}
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    style={{ background: 'var(--gradient-primary)', color: '#fff' }}
                  >
                    {insightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analyze My Health Journey
                  </button>
                )}

                {timelineEntries.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>No timeline entries saved yet.</p>
                ) : (
                  <div className="space-y-3">
                    {timelineEntries.map((entry) => (
                      <div key={entry.id} className="rounded-xl p-4" style={{ background: 'var(--surface2)', borderLeft: '3px solid var(--teal)' }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-[120px]">
                            <p className="text-lg font-semibold leading-none" style={{ color: 'var(--text)' }}>{entry.date}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{entry.patientName}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                              {entry.drugs.map((d) => d.name).join(', ') || 'No drugs captured'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeTimelineEntry(entry.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                            style={{ color: '#D85A30', border: '1px solid rgba(216,90,48,0.35)', background: 'rgba(216,90,48,0.08)' }}
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {journeyError && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(216,90,48,0.08)', border: '1px solid rgba(216,90,48,0.3)' }}>
                    <p className="text-xs" style={{ color: '#D85A30' }}>{journeyError}</p>
                  </div>
                )}

                {journeyInsights && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(29,158,117,0.09)', border: '1px solid rgba(29,158,117,0.35)' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>AI Health Insights</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text2)' }}>{journeyInsights}</p>
                    <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
                      This is AI-generated analysis, not a medical diagnosis.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>How it works</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Upload photo', desc: 'Any prescription - handwritten, typed, faded, torn' },
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
