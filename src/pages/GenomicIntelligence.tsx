import { useMemo, useState, type ChangeEvent } from 'react'
import { Canvas } from '@react-three/fiber'
import { Dna, FileUp, Sparkles } from 'lucide-react'
import DNAModel from '../components/genomics/DNAModel'
import InsightPanel from '../components/genomics/InsightPanel'
import { analyzeGenomicsInput, type GenomicInsight } from '../utils/genomicsInsights'

const sampleSequence =
  'ATGCGTCCAGCAGCAGCAGTTCGACCGGTACGCGGGCGGGCGGGTTAGCCATGATCCGAATTCAGGTTAACTCGATCGTACGATGCTA'

export default function GenomicIntelligence() {
  const [dnaSequence, setDnaSequence] = useState(sampleSequence)
  const [datasetText, setDatasetText] = useState('gene,flag\nAPOE,drug response\nTPMT,metabolism\n')
  const [notesText, setNotesText] = useState('Possible protein misfolding region near exon 6. Monitor adverse response markers.')
  const [selectedInsightId, setSelectedInsightId] = useState<string>()
  const [hoveredInsightId, setHoveredInsightId] = useState<string>()

  const analysis = useMemo(
    () =>
      analyzeGenomicsInput({
        dnaSequence,
        datasetText,
        notesText,
      }),
    [datasetText, dnaSequence, notesText],
  )

  const activeInsightId = hoveredInsightId ?? selectedInsightId
  const selectedInsight = analysis.insights.find((insight) => insight.id === activeInsightId)

  const onFileUpload = async (event: ChangeEvent<HTMLInputElement>, target: 'dna' | 'dataset' | 'notes') => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()

    if (target === 'dna') {
      setDnaSequence(text)
    } else if (target === 'dataset') {
      setDatasetText(text)
    } else {
      setNotesText(text)
    }

    event.target.value = ''
  }

  const focusInsight = (insight: GenomicInsight) => {
    setSelectedInsightId(insight.id)
  }

  const severityTone = (insight: GenomicInsight) => {
    if (insight.severity === 'high') {
      return { background: 'rgba(67, 222, 188, 0.18)', color: '#a1ffe9' }
    }
    if (insight.severity === 'moderate') {
      return { background: 'rgba(67, 222, 188, 0.12)', color: '#87edd6' }
    }
    return { background: 'rgba(67, 222, 188, 0.08)', color: '#73d2bd' }
  }

  return (
    <div
      className="min-h-screen p-6 lg:p-10"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,200,160,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,160,0.015) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }}
    >
      <div className="max-w-[1380px] mx-auto space-y-6">
        <header className="flex items-start justify-between gap-5 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(28, 179, 148, 0.14)' }}
              >
                <Dna className="w-5 h-5" style={{ color: '#6dffe0' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  Genomics visualization
                </h1>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  DNA is the live core: anomaly data maps directly to structure, flow, and focus behavior.
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(9, 40, 49, 0.58)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#6ff5d6' }} />
            <p className="text-xs" style={{ color: '#bafced' }}>
              AI-assisted insights - not a medical diagnosis.
            </p>
          </div>
        </header>

        <section className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(95, 255, 223, 0.22)' }}>
          <div
            className="h-[640px] w-full"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(34, 126, 112, 0.32), rgba(4, 19, 28, 0.96) 68%)',
            }}
          >
            <Canvas
              dpr={[1, 1.7]}
              camera={{ position: [0, 0, 8], fov: 42 }}
              gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
            >
              <ambientLight color="#84ffe6" intensity={0.5} />
              <pointLight position={[4, 5, 4]} color="#88ffe7" intensity={1.8} />
              <pointLight position={[-5, -4, -2]} color="#31d6b2" intensity={1.2} />
              <DNAModel
                insights={analysis.insights}
                sequenceLength={analysis.cleanedSequence.length}
                activeInsightId={activeInsightId}
                onInsightFocus={focusInsight}
              />
            </Canvas>
          </div>

          <div className="absolute top-4 left-4 right-4 grid gap-4 lg:grid-cols-[1fr,320px] pointer-events-none">
            <div className="pointer-events-auto">
              <InsightPanel selectedInsight={selectedInsight} summary={analysis.summary} />
            </div>
            <div className="glass rounded-xl p-4 pointer-events-auto" style={{ background: 'rgba(7, 30, 38, 0.58)' }}>
              <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                Highlighted regions
              </h2>
              <div className="space-y-2 max-h-[260px] overflow-auto pr-1 scrollbar-hide">
                {analysis.insights.map((insight) => (
                  <button
                    key={insight.id}
                    onClick={() => focusInsight(insight)}
                    onMouseEnter={() => setHoveredInsightId(insight.id)}
                    onMouseLeave={() => setHoveredInsightId(undefined)}
                    className="w-full text-left rounded-lg px-3 py-2 transition-colors"
                    style={{
                      border: activeInsightId === insight.id ? '1px solid rgba(108, 255, 226, 0.5)' : '1px solid var(--border)',
                      background:
                        activeInsightId === insight.id
                          ? 'rgba(43, 132, 116, 0.28)'
                          : 'rgba(10, 33, 43, 0.66)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {insight.title}
                      </p>
                      <span className="text-[10px] px-2 py-1 rounded-full uppercase" style={severityTone(insight)}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>
                      Bases {insight.start}-{insight.end} - {insight.source}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-xl p-4 space-y-2" style={{ background: 'rgba(7, 30, 38, 0.72)' }}>
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
              DNA sequence
            </label>
            <textarea
              value={dnaSequence}
              onChange={(event) => setDnaSequence(event.target.value)}
              className="w-full h-28 rounded-lg p-3 text-xs font-mono focus:outline-none"
              style={{ background: 'rgba(8, 30, 38, 0.86)', color: 'var(--text)', border: '1px solid var(--border)' }}
              placeholder="Paste nucleotide sequence..."
            />
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text2)' }}>
              <FileUp className="w-4 h-4" />
              Upload DNA file
              <input type="file" className="hidden" onChange={(event) => onFileUpload(event, 'dna')} />
            </label>
          </div>

          <div className="glass rounded-xl p-4 space-y-2" style={{ background: 'rgba(7, 30, 38, 0.72)' }}>
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
              Medical dataset/report
            </label>
            <textarea
              value={datasetText}
              onChange={(event) => setDatasetText(event.target.value)}
              className="w-full h-28 rounded-lg p-3 text-xs focus:outline-none"
              style={{ background: 'rgba(8, 30, 38, 0.86)', color: 'var(--text2)', border: '1px solid var(--border)' }}
              placeholder="Paste JSON/CSV data..."
            />
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text2)' }}>
              <FileUp className="w-4 h-4" />
              Upload dataset file
              <input type="file" className="hidden" onChange={(event) => onFileUpload(event, 'dataset')} />
            </label>
          </div>

          <div className="glass rounded-xl p-4 space-y-2" style={{ background: 'rgba(7, 30, 38, 0.72)' }}>
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
              Prescription/notes
            </label>
            <textarea
              value={notesText}
              onChange={(event) => setNotesText(event.target.value)}
              className="w-full h-28 rounded-lg p-3 text-xs focus:outline-none"
              style={{ background: 'rgba(8, 30, 38, 0.86)', color: 'var(--text2)', border: '1px solid var(--border)' }}
              placeholder="Paste notes or observations..."
            />
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text2)' }}>
              <FileUp className="w-4 h-4" />
              Upload notes file
              <input type="file" className="hidden" onChange={(event) => onFileUpload(event, 'notes')} />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
