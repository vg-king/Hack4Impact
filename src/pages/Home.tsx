import { useMemo, useState, type ComponentType, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Bot, HeartPulse, MapPin, ScanLine, ShieldAlert, Siren } from 'lucide-react'

interface HomeCategoryCardProps {
  title: string
  description: string
  to: string
  color: string
  icon: ComponentType<{ className?: string; style?: CSSProperties }>
}

function HomeCategoryCard({ title, description, to, color, icon: Icon }: HomeCategoryCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className="glass rounded-2xl p-6 text-left w-full transition-all duration-200"
      style={{ borderColor: `${color}55`, minHeight: 180 }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}22` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
      <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>{description}</p>
    </button>
  )
}

export default function Home() {
  const [query, setQuery] = useState('')

  const categoryCards = useMemo(
    () => [
      {
        title: 'Diagnostics',
        description: 'AI analysis, reports, disease detection, risk scoring and file intelligence.',
        to: '/diagnostics',
        color: '#22c55e',
        icon: Activity,
        keywords: ['ai assistant', 'prescription', 'ocr', 'cv disease', 'risk predictor', 'file analyzer', 'diagnostics'],
      },
      {
        title: 'Find Care',
        description: 'Doctor search, pharmacy lookup and hospital operations support tools.',
        to: '/find-care',
        color: '#38bdf8',
        icon: MapPin,
        keywords: ['find doctors', 'pharmacy finder', 'hospital ops', 'care', 'doctor'],
      },
      {
        title: 'Wellness',
        description: 'Mental health, diet planning, genomics and wearable monitoring modules.',
        to: '/wellness',
        color: '#f59e0b',
        icon: HeartPulse,
        keywords: ['mental health', 'diet plans', 'genomics', 'iot wearables', 'wellness'],
      },
      {
        title: 'Emergency',
        description: 'Rapid-response emergency mode with SOS and immediate action workflows.',
        to: '/emergency',
        color: '#ef4444',
        icon: ShieldAlert,
        keywords: ['emergency', 'sos', 'urgent', 'critical'],
      },
    ],
    [],
  )

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categoryCards

    return categoryCards.filter((card) => {
      const searchText = `${card.title} ${card.keywords.join(' ')}`.toLowerCase()
      return searchText.includes(q)
    })
  }, [categoryCards, query])

  const featuredTools = [
    {
      title: 'Prescription OCR',
      description: 'Extract medications and dosage from handwritten prescriptions in seconds.',
      to: '/prescription-ocr',
      icon: ScanLine,
    },
    {
      title: 'AI Assistant',
      description: 'Conversational clinical support for quick triage, summaries, and insights.',
      to: '/ai-assistant',
      icon: Bot,
    },
    {
      title: 'Emergency SOS',
      description: 'Launch immediate emergency workflow with rapid response actions.',
      to: '/emergency',
      icon: Siren,
    },
  ]

  const techBadges = ['MedNexus AI Vision', 'MedNexus AI Engine', 'Spring Boot', 'Apache Kafka', 'Redis', 'Docker', 'MySQL']

  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-56px)] p-6 lg:p-10 bg-grid">
      <div className="max-w-[1280px] mx-auto space-y-6">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text3)' }}>
            KIIT · HACK4IMPACT 2026 · Team Nemesis
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
            AI-powered healthcare, built for India
          </h1>
          <p className="text-base" style={{ color: 'var(--text2)' }}>
            12 intelligent modules. One unified platform.
          </p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search features - try 'prescription' or 'doctor'..."
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{
              background: 'rgba(12, 32, 48, 0.72)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              boxShadow: 'inset 0 0 0 1px rgba(32, 120, 102, 0.1)',
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <HomeCategoryCard
                key={card.title}
                title={card.title}
                description={card.description}
                to={card.to}
                color={card.color}
                icon={card.icon}
              />
            ))
          ) : (
            <div
              className="glass rounded-2xl p-6 md:col-span-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                No category match for "{query}". Try "doctor", "prescription", "genomics", or "emergency".
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl p-4" style={{ background: 'rgba(13, 36, 50, 0.86)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase" style={{ color: 'var(--text3)' }}>12 AI Modules</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Total intelligent features</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(13, 36, 50, 0.86)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase" style={{ color: 'var(--text3)' }}>MedNexus AI Engine</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Dual AI engine powering the platform</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(13, 36, 50, 0.86)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase" style={{ color: 'var(--text3)' }}>Real-time OCR</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Reads any doctor handwriting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTools.map((tool) => (
              <div
                key={tool.title}
                className="glass rounded-2xl p-5"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30, 163, 135, 0.2)' }}>
                  <tool.icon className="w-5 h-5" style={{ color: '#6ff5d6' }} />
                </div>
                <h3 className="text-lg font-semibold mt-4" style={{ color: 'var(--text)' }}>{tool.title}</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>{tool.description}</p>
                <button
                  onClick={() => navigate(tool.to)}
                  className="mt-4 text-sm font-semibold"
                  style={{ color: '#7efee2' }}
                >
                  Launch -&gt;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--text3)' }}>
            Built with
          </p>
          <div className="flex flex-wrap gap-2">
            {techBadges.map((badge) => (
              <span
                key={badge}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  color: 'var(--text2)',
                  background: 'rgba(12, 30, 40, 0.7)',
                  border: '1px solid rgba(96, 155, 140, 0.25)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
