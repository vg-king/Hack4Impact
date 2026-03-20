import { Activity, MapPin, Pill } from 'lucide-react'
import CategoryToolCard from '../components/CategoryToolCard'

export default function FindCare() {
  return (
    <div className="min-h-[calc(100vh-56px)] p-6 lg:p-10 bg-grid">
      <div className="max-w-[1280px] mx-auto space-y-5">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Find Care</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Doctors, pharmacy, and hospital support modules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryToolCard icon={MapPin} name="Find Doctors" description="Search specialists and care providers near the patient." to="/find-doctors" />
          <CategoryToolCard icon={Pill} name="Pharmacy Finder" description="Locate nearby pharmacies and medication support." to="/pharmacy" />
          <CategoryToolCard icon={Activity} name="Hospital Ops" description="Operational dashboard for in-hospital care workflows." to="/hospital-ops" />
        </div>
      </div>
    </div>
  )
}
