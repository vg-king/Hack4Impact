import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Phone, MapPin, Shield, Heart, Truck, Flame, UserX } from 'lucide-react'

const emergencyContacts = [
  { name: 'National Emergency', number: '112', icon: Shield, color: '#D85A30', desc: 'All emergencies' },
  { name: 'Ambulance', number: '108', icon: Truck, color: '#D85A30', desc: 'Medical emergency' },
  { name: 'Police', number: '100', icon: Shield, color: '#378ADD', desc: 'Law & order' },
  { name: 'Fire Brigade', number: '101', icon: Flame, color: '#BA7517', desc: 'Fire emergency' },
  { name: 'Women Helpline', number: '1091', icon: Phone, color: '#D4537E', desc: '24/7 support' },
  { name: 'Child Helpline', number: '1098', icon: Heart, color: '#1D9E75', desc: 'Child in distress' },
  { name: 'Senior Citizen', number: '14567', icon: UserX, color: '#7F77DD', desc: 'Elder abuse' },
  { name: 'iCall Mental', number: '9152987821', icon: Heart, color: '#D4537E', desc: 'Mental crisis' },
]

const nearbyHospitals = [
  { name: 'AIIMS Emergency', distance: '2.3 km', time: '8 min', beds: 12, level: 'Trauma Level 1', color: '#1D9E75' },
  { name: 'Max Hospital ER', distance: '3.7 km', time: '12 min', beds: 5, level: 'Cardiac Centre', color: '#BA7517' },
  { name: 'Fortis Emergency', distance: '5.1 km', time: '15 min', beds: 8, level: 'Multi-specialty', color: '#1D9E75' },
  { name: 'Safdarjung Hospital', distance: '6.4 km', time: '18 min', beds: 22, level: 'Govt · Free', color: '#1D9E75' },
]

const firstAidGuides = [
  { title: 'Heart attack', steps: ['Call 112 immediately', 'Have patient sit/lie down', 'Loosen tight clothing', 'Give aspirin 325mg if not allergic', 'Begin CPR if unconscious', 'AED if available'], urgent: true },
  { title: 'Stroke (FAST)', steps: ['F — Face drooping?', 'A — Arm weakness?', 'S — Speech difficulty?', 'T — Time to call 112', 'Note exact time of symptoms', 'Do NOT give food or water'], urgent: true },
  { title: 'Choking', steps: ['Ask "Are you choking?"', '5 back blows between shoulder blades', '5 abdominal thrusts (Heimlich)', 'Alternate until cleared', 'Call 108 if unconscious'], urgent: true },
  { title: 'Severe bleeding', steps: ['Apply direct firm pressure', 'Use clean cloth/bandage', 'Do NOT remove cloth (add more)', 'Elevate limb above heart', 'Call 108 for major bleeding'], urgent: false },
]

export default function EmergencySOS() {
  const [sosActive, setSosActive] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [selectedGuide, setSelectedGuide] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const triggerSOS = () => {
    if (sosActive) { cancelSOS(); return }
    setSosActive(true); setCountdown(5)
    timerRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(timerRef.current); setSosSent(true); setSosActive(false); return 0 }
        return p - 1
      })
    }, 1000)
  }

  const cancelSOS = () => {
    clearInterval(timerRef.current); setSosActive(false); setCountdown(5)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Emergency SOS</h1>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>GPS-enabled · AI hospital routing · under 30 seconds to dispatch</p>
      </motion.div>

      {/* SOS Button */}
      <div className="flex flex-col items-center py-6">
        {sosSent ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(29,158,117,0.15)', border: '3px solid var(--emerald)' }}>
              <Shield className="w-16 h-16" style={{ color: 'var(--emerald)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--emerald)' }}>SOS Alert Sent!</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>Emergency services notified · Help is on the way · ETA 8 min</p>
            <button onClick={() => { setSosSent(false); setCountdown(5) }}
              className="px-5 py-2 rounded-xl text-sm font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}>
              Reset
            </button>
          </motion.div>
        ) : (
          <>
            <div className="relative" onClick={triggerSOS}>
              <div className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: '#D85A30', animationDuration: '2s' }} />
              <button className="relative w-44 h-44 rounded-full flex flex-col items-center justify-center text-white transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #D85A30, #D4537E)' }}>
                {sosActive ? (
                  <>
                    <span className="text-5xl font-bold">{countdown}</span>
                    <span className="text-sm opacity-80 mt-1">Tap to cancel</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-12 h-12 mb-1" />
                    <span className="text-lg font-bold">SOS</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--text3)' }}>
              {sosActive ? `Sending emergency alert in ${countdown}s...` : 'Tap to activate · Hold 5 seconds to send'}
            </p>
          </>
        )}
      </div>

      {/* Emergency Contacts */}
      <div>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>Emergency contacts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {emergencyContacts.map(c => (
            <a key={c.number} href={`tel:${c.number}`}
              className="glass glass-hover rounded-xl p-4 text-center block">
              <c.icon className="w-7 h-7 mx-auto mb-2" style={{ color: c.color }} />
              <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>{c.number}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text)' }}>{c.name}</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>{c.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Nearest ERs */}
      <div>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>Nearest emergency rooms · Live bed count</h2>
        <div className="space-y-2">
          {nearbyHospitals.map((h, i) => (
            <motion.div key={h.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(216,90,48,0.15)' }}>
                  <MapPin className="w-4 h-4" style={{ color: 'var(--coral)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{h.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>{h.distance} · ~{h.time} · {h.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: h.color }}>{h.beds} beds free</p>
                <button className="text-xs px-3 py-1 rounded-lg mt-1" style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}>
                  Navigate
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* First Aid Quick Guides */}
      <div>
        <h2 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>First aid quick guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {firstAidGuides.map((g, i) => (
            <div key={g.title} className="glass rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedGuide(selectedGuide === i ? null : i)}>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {g.urgent && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D85A30' }} />}
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{g.title}</p>
                  {g.urgent && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(216,90,48,0.1)', color: '#993C1D' }}>URGENT</span>}
                </div>
                <span style={{ color: 'var(--text3)', fontSize: '12px' }}>{selectedGuide === i ? '▲' : '▼'}</span>
              </div>
              {selectedGuide === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                  className="px-4 pb-4 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                  {g.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-2 pt-1">
                      <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: '#D85A30' }}>{j + 1}.</span>
                      <p className="text-xs" style={{ color: 'var(--text2)' }}>{step}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Crisis banner */}
      <div className="rounded-xl p-5 text-center"
        style={{ background: 'linear-gradient(135deg,rgba(216,90,48,0.1),rgba(212,83,126,0.1))', border: '1px solid rgba(216,90,48,0.3)' }}>
        <h2 className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>Mental health crisis?</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>You are not alone. Reach out right now.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="tel:9152987821" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'rgba(212,83,126,0.7)' }}>iCall: 9152987821</a>
          <a href="tel:08046110007" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'rgba(127,119,221,0.7)' }}>NIMHANS: 080-46110007</a>
          <a href="tel:18005990019" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'rgba(29,158,117,0.7)' }}>Vandrevala: 1800-599-0019</a>
        </div>
      </div>
    </div>
  )
}