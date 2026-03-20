import { Apple, Dna, Heart, Watch } from 'lucide-react'
import CategoryToolCard from '../components/CategoryToolCard'

export default function Wellness() {
  return (
    <div className="min-h-[calc(100vh-56px)] p-6 lg:p-10 bg-grid">
      <div className="max-w-[1280px] mx-auto space-y-5">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Wellness</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Preventive and lifestyle modules for long-term health outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryToolCard icon={Heart} name="Mental Health" description="Mood tracking, screening, and mental wellbeing guidance." to="/mental-health" />
          <CategoryToolCard icon={Apple} name="Diet Plans" description="Nutrition planning tailored to health goals and risks." to="/diet" />
          <CategoryToolCard icon={Dna} name="Genomics" description="Interactive genomics visualization and insight overlays." to="/genomics" />
          <CategoryToolCard icon={Watch} name="IoT Wearables" description="Live vitals and remote monitoring from wearable devices." to="/iot-wearables" />
        </div>
      </div>
    </div>
  )
}
