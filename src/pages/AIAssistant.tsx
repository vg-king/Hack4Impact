import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Sparkles, Stethoscope, Pill, Brain, Loader2, Mic, MicOff, Trash2 } from 'lucide-react'
import { askGemini } from '../utils/gemini'

interface Message { role: 'user' | 'assistant'; content: string; time: Date }

const quickPrompts = [
  { icon: Stethoscope, text: 'I have chest pain and shortness of breath', label: 'Symptom check' },
  { icon: Pill, text: 'Explain: Metformin 500mg twice daily with meals', label: 'Prescription' },
  { icon: Brain, text: 'Stroke warning signs and what to do immediately', label: 'Emergency' },
  { icon: Sparkles, text: 'Best diet plan for Type 2 Diabetes patients', label: 'Nutrition AI' },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    setMessages(p => [...p, { role: 'user', content: text, time: new Date() }])
    setInput('')
    setLoading(true)
    try {
      const res = await askGemini(text)
      setMessages(p => [...p, { role: 'assistant', content: res, time: new Date() }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: '⚠️ Unable to connect to Gemini AI. Check your VITE_GEMINI_API_KEY in .env', time: new Date() }])
    } finally { setLoading(false) }
  }

  const toggleVoice = () => {
    const SR = (window.SpeechRecognition || window.webkitSpeechRecognition) as typeof SpeechRecognition | undefined
    if (!SR) { alert('Voice only works in Chrome browser'); return }
    if (listening) { recRef.current?.stop(); setListening(false); return }
    const r = new SR(); r.lang = 'en-IN'; r.continuous = false
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false) }
    r.onerror = r.onend = () => setListening(false)
    recRef.current = r; r.start(); setListening(true)
  }

  const fmt = (text: string) => text.split('\n').map((line, i) => {
    if (/^\*\*(.+)\*\*$/.test(line)) return <p key={i} className="font-bold mt-2 first:mt-0 text-sm" style={{ color: 'var(--teal-bright)' }}>{line.replace(/\*\*/g,'')}</p>
    if (line.startsWith('- ') || line.startsWith('• ')) return <p key={i} className="text-sm ml-3 flex gap-2"><span style={{ color: 'var(--teal)' }}>›</span>{line.slice(2)}</p>
    if (/^\d+\. /.test(line)) return <p key={i} className="text-sm ml-3">{line}</p>
    if (/^\*[^*].+\*$/.test(line)) return <p key={i} className="text-xs italic mt-1" style={{ color: 'var(--text3)' }}>{line.replace(/\*/g,'')}</p>
    return line ? <p key={i} className="text-sm">{line}</p> : <br key={i} />
  })

  return (
    <div className="flex flex-col h-screen bg-grid">
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm" style={{ color: 'var(--text)' }}>AI Health Assistant</h1>
            <p className="text-xs" style={{ color: 'var(--text2)' }}>Gemini 1.5 Flash · Symptom triage · Prescription analysis · Voice input</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--emerald)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--emerald)' }}>Gemini active</span>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="p-1.5 rounded-lg glass-hover" style={{ color: 'var(--text2)' }}>
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 animate-float" style={{ background: 'var(--gradient-primary)' }}>
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-gradient">How can I help you today?</h2>
            <p className="text-sm mb-7 max-w-md" style={{ color: 'var(--text2)' }}>Ask about symptoms, medications, diet, mental health, or emergencies.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {quickPrompts.map((q, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => send(q.text)} className="glass glass-hover rounded-xl p-3.5 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <q.icon className="w-4 h-4" style={{ color: 'var(--teal)' }} />
                    <span className="text-xs font-mono font-medium" style={{ color: 'var(--teal)' }}>{q.label}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>{q.text}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'var(--gradient-primary)' }}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? '' : 'glass'}`}
                style={msg.role === 'user' ? { background: 'var(--gradient-primary)', color: 'white' } : { color: 'var(--text)' }}>
                <div className="space-y-1 leading-relaxed">
                  {msg.role === 'assistant' ? fmt(msg.content) : <p className="text-sm">{msg.content}</p>}
                </div>
                <p className="text-xs mt-1.5 font-mono" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.4)' : 'var(--text3)' }}>
                  {msg.time.toLocaleTimeString()}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--text2)' }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="glass rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--teal)' }} />
                <span className="text-xs" style={{ color: 'var(--text2)' }}>Gemini is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Describe symptoms or ask about medications..."
              className="w-full rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <button type="button" onClick={toggleVoice}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
              style={{ color: listening ? 'var(--coral)' : 'var(--text3)' }}>
              {listening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={!input.trim() || loading}
            className="px-5 rounded-xl text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ background: 'var(--gradient-primary)' }}>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-xs mt-2" style={{ color: 'var(--text3)' }}>
          AI responses are informational only. Always consult a qualified doctor for medical decisions.
        </p>
      </div>
    </div>
  )
}