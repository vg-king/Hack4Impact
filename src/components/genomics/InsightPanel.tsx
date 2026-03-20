import { AlertCircle, Info, Sparkles } from 'lucide-react'
import type { GenomicInsight } from '../../utils/genomicsInsights'

interface InsightPanelProps {
  selectedInsight?: GenomicInsight
  summary: string
}

const severityStyles: Record<GenomicInsight['severity'], { bg: string; color: string }> = {
  high: { bg: 'rgba(73, 231, 190, 0.22)', color: '#9dffe8' },
  moderate: { bg: 'rgba(73, 231, 190, 0.16)', color: '#8df4dd' },
  low: { bg: 'rgba(73, 231, 190, 0.1)', color: '#7adcc7' },
}

export default function InsightPanel({ selectedInsight, summary }: InsightPanelProps) {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: '#6ff5d6' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Insight overlay
        </p>
      </div>

      {selectedInsight ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {selectedInsight.title}
            </h3>
            <span
              className="text-[11px] px-2 py-1 rounded-full uppercase tracking-wide"
              style={severityStyles[selectedInsight.severity]}
            >
              {selectedInsight.severity}
            </span>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
            {selectedInsight.explanation}
          </p>

          <p className="text-[11px]" style={{ color: 'var(--text3)' }}>
            Source: {selectedInsight.source}
          </p>
        </>
      ) : (
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5" style={{ color: 'var(--text3)' }} />
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Hover or click a highlighted voxel region in the DNA model to inspect it.
          </p>
        </div>
      )}

      <div className="rounded-lg p-3" style={{ background: 'rgba(24, 58, 68, 0.45)' }}>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>{summary}</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: 'rgba(28, 70, 76, 0.35)' }}>
        <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#79f9db' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#bafced' }}>
          AI-assisted insights - not a medical diagnosis.
        </p>
      </div>
    </div>
  )
}