import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Props { icon: LucideIcon; label: string; value: string; sub?: string; color?: string; delay?: number }

export default function StatCard({ icon: Icon, label, value, sub, color = 'var(--teal)', delay = 0 }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass glass-hover rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {sub && <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ background: `${color}15`, color }}>{sub}</span>}
      </div>
      <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{label}</p>
    </motion.div>
  )
}