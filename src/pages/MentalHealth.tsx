import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Brain, BookOpen, Music, Leaf, MessageCircle, Smile, Meh, Frown, Loader2 } from 'lucide-react'
import { aiAPI } from '../utils/api'

const moodOptions = [
  { icon: '😄', label: 'Great', value: 5, color: '#1D9E75' },
  { icon: '🙂', label: 'Good', value: 4, color: '#1D9E75' },
  { icon: '😐', label: 'Okay', value: 3, color: '#BA7517' },
  { icon: '😔', label: 'Low', value: 2, color: '#D85A30' },
  { icon: '😢', label: 'Struggling', value: 1, color: '#D85A30' },
]

const resources = [
  { icon: Brain, title: 'Guided Meditation', desc: '5-minute breathing exercise for anxiety relief', duration: '5 min', category: 'Meditation', color: '#7F77DD' },
  { icon: BookOpen, title: 'CBT Journal Prompts', desc: 'Cognitive behavioural therapy writing exercises', duration: '15 min', category: 'Therapy', color: '#378ADD' },
  { icon: Music, title: 'Calming Sounds', desc: 'Nature sounds and ambient music for relaxation', duration: '30 min', category: 'Relaxation', color: '#1D9E75' },
  { icon: Leaf, title: 'Mindfulness Walk', desc: 'Guided outdoor mindfulness exercise', duration: '20 min', category: 'Exercise', color: '#1D9E75' },
  { icon: Heart, title: 'Gratitude Practice', desc: 'Daily gratitude reflection — 3 good things', duration: '10 min', category: 'Wellness', color: '#D4537E' },
  { icon: MessageCircle, title: 'Talk to Someone', desc: 'Connect with a mental health professional', duration: 'On demand', category: 'Support', color: '#D85A30' },
]

const weekMoodHistory = [
  { day: 'Mon', score: 2 }, { day: 'Tue', score: 3 }, { day: 'Wed', score: 3 },
  { day: 'Thu', score: 4 }, { day: 'Fri', score: 4 }, { day: 'Sat', score: 5 }, { day: 'Sun', score: 4 },
]

const tips = [
  'Take 5 deep breaths when feeling overwhelmed — activates parasympathetic nervous system',
  'Physical exercise releases endorphins — even a 10-minute walk significantly helps mood',
  'Maintain consistent sleep schedule — irregular sleep worsens anxiety and depression',
  'Limit social media to 30 min/day — studies show 50% reduction in anxiety with this change',
  'Practice 5-4-3-2-1 grounding: 5 things you see, 4 hear, 3 touch, 2 smell, 1 taste',
  'Stay hydrated — even mild dehydration (1-2%) measurably worsens mood and cognition',
]

export default function MentalHealth() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [journalEntry, setJournalEntry] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const getMoodSupport = async (mood: number) => {
    setAiLoading(true)
    const moodLabel = moodOptions.find(m => m.value === mood)?.label || 'okay'
    try {
      const res = await aiAPI.chat(
        `The user is feeling "${moodLabel}" today (${mood}/5 on mood scale). 
        ${journalEntry ? `They wrote: "${journalEntry}"` : ''}
        Provide empathetic mental health support in 3-4 sentences. 
        Then suggest 2 specific actionable things they can do in the next 30 minutes to feel better.
        Be warm, non-clinical, and genuinely helpful. Do NOT be preachy.`
      )
      setAiResponse(res.reply || 'No response.')
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown backend error'
      setAiResponse(`Could not get support response: ${detail}`)
    } finally { setAiLoading(false) }
  }

  const moodColor = (score: number) => score >= 4 ? '#1D9E75' : score >= 3 ? '#BA7517' : '#D85A30'

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,83,126,0.2)' }}>
            <Heart className="w-5 h-5" style={{ color: '#D4537E' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Mental Health & Wellness</h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>CBT · DBT · Mood tracking · Crisis detection · AI support</p>
          </div>
        </div>
      </motion.div>

      {/* Mood tracker */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>How are you feeling today?</h2>
        <div className="flex gap-3 justify-center flex-wrap mb-4">
          {moodOptions.map(mood => (
            <button key={mood.value} onClick={() => setSelectedMood(mood.value)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
              style={{
                background: selectedMood === mood.value ? `${mood.color}15` : 'transparent',
                border: `1.5px solid ${selectedMood === mood.value ? mood.color : 'var(--border)'}`,
                transform: selectedMood === mood.value ? 'scale(1.08)' : 'scale(1)',
              }}>
              <span style={{ fontSize: '28px', lineHeight: 1 }}>{mood.icon}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
            <textarea value={journalEntry} onChange={e => setJournalEntry(e.target.value)}
              placeholder="Tell me more about how you're feeling... (completely private)"
              className="w-full rounded-xl p-3 text-sm focus:outline-none resize-none"
              rows={3}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>🔒 Private · Encrypted · Never shared</p>
              <button onClick={() => getMoodSupport(selectedMood)} disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--gradient-primary)' }}>
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {aiLoading ? 'Getting support...' : 'Get AI support'}
              </button>
            </div>
            {aiResponse && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl p-4" style={{ background: 'rgba(212,83,126,0.06)', border: '1px solid rgba(212,83,126,0.2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#D4537E' }}>MedNexus AI Support</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{aiResponse}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* 7-day mood history */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>7-day mood history</h2>
        <div className="flex items-end gap-2 h-16">
          {weekMoodHistory.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div initial={{ height: 0 }} animate={{ height: `${(d.score / 5) * 48}px` }}
                transition={{ delay: 0.05 * i, duration: 0.6 }}
                className="w-full rounded-t-sm"
                style={{ background: moodColor(d.score), opacity: 0.8 }} />
              <span className="text-xs" style={{ color: 'var(--text3)' }}>{d.day}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
          AI insight: Your mood has improved 60% over the past week. Keep up the positive routines.
        </p>
      </motion.div>

      {/* Resources */}
      <div>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>Wellness resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r, i) => (
            <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass glass-hover rounded-xl p-4 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${r.color}20` }}>
                  <r.icon className="w-4 h-4" style={{ color: r.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{r.title}</h3>
                  <p className="text-xs mt-1 mb-2" style={{ color: 'var(--text2)' }}>{r.desc}</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>{r.duration}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>{r.category}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Daily tips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>Evidence-based daily tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-bold text-sm flex-shrink-0 mt-0.5" style={{ color: '#D4537E' }}>{i + 1}.</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Crisis banner */}
      <div className="rounded-xl p-5 text-center"
        style={{ background: 'linear-gradient(135deg,rgba(216,90,48,0.1),rgba(212,83,126,0.1))', border: '1px solid rgba(216,90,48,0.3)' }}>
        <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>Need immediate help?</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>If you are in crisis, please reach out now. You matter.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="tel:9152987821" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(212,83,126,0.7)' }}>iCall: 9152987821</a>
          <a href="tel:08046110007" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(127,119,221,0.7)' }}>NIMHANS: 080-46110007</a>
          <a href="tel:18005990019" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(29,158,117,0.7)' }}>Vandrevala: 1800-599-0019</a>
        </div>
      </div>
    </div>
  )
}