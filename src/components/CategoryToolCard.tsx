import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface CategoryToolCardProps {
  icon: LucideIcon
  name: string
  description: string
  to: string
}

export default function CategoryToolCard({ icon: Icon, name, description, to }: CategoryToolCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="glass rounded-xl p-4 flex items-start justify-between gap-4"
      style={{ minHeight: 120 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0, 200, 160, 0.14)' }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--teal-bright)' }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{name}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{description}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(to)}
        className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1"
        style={{ background: 'rgba(0, 200, 160, 0.12)', color: 'var(--teal-bright)', border: '1px solid var(--border)' }}
      >
        Open
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  )
}
