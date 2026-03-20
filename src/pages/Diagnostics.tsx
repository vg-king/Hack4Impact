import { Bot, Camera, FileSearch, ScrollText, Brain } from 'lucide-react'
import CategoryToolCard from '../components/CategoryToolCard'

export default function Diagnostics() {
  return (
    <div className="min-h-[calc(100vh-56px)] p-6 lg:p-10 bg-grid">
      <div className="max-w-[1280px] mx-auto space-y-5">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Diagnostics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Clinical intelligence tools in a clean two-column grid.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryToolCard icon={Bot} name="AI Assistant" description="Conversational medical guidance and triage support." to="/ai-assistant" />
          <CategoryToolCard icon={ScrollText} name="Prescription OCR" description="Extract and interpret handwritten prescriptions." to="/prescription-ocr" />
          <CategoryToolCard icon={Camera} name="CV Disease Detect" description="Computer-vision supported disease signal detection." to="/cv-detection" />
          <CategoryToolCard icon={Brain} name="Risk Predictor" description="Predictive analytics for patient risk stratification." to="/predictive-risk" />
          <CategoryToolCard icon={FileSearch} name="File Analyzer" description="Analyze reports, scans, and uploaded medical files." to="/file-analyzer" />
        </div>
      </div>
    </div>
  )
}
