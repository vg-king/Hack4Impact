import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Pill, Search, MapPin, Clock, Phone, Star, CheckCircle, XCircle } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const pharmacyIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50%;background:hsl(38,92%,50%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center">
    <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

const selectedIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:34px;height:34px;border-radius:50%;background:hsl(168,80%,36%);border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center">
    <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
})

const pharmacies = [
  {
    id: 1, name: 'Apollo Pharmacy', address: 'Connaught Place, New Delhi',
    lat: 28.6315, lng: 77.2167, rating: 4.7, open: true,
    phone: '+91 11 4567 8901', hours: '8AM - 10PM',
    medicines: ['Paracetamol', 'Amoxicillin', 'Metformin', 'Insulin', 'Aspirin', 'Omeprazole', 'Atorvastatin'],
  },
  {
    id: 2, name: 'MedPlus', address: 'Koramangala, Bangalore',
    lat: 12.9352, lng: 77.6245, rating: 4.5, open: true,
    phone: '+91 80 2345 6789', hours: '7AM - 11PM',
    medicines: ['Azithromycin', 'Cetirizine', 'Metformin', 'Atorvastatin', 'Amlodipine', 'Losartan'],
  },
  {
    id: 3, name: 'Netmeds Store', address: 'T Nagar, Chennai',
    lat: 13.0418, lng: 80.2341, rating: 4.6, open: false,
    phone: '+91 44 3456 7890', hours: '9AM - 9PM',
    medicines: ['Paracetamol', 'Ibuprofen', 'Dolo 650', 'Crocin', 'Combiflam', 'Pantoprazole'],
  },
  {
    id: 4, name: 'PharmEasy Outlet', address: 'Bandra West, Mumbai',
    lat: 19.0596, lng: 72.8295, rating: 4.8, open: true,
    phone: '+91 22 4567 8901', hours: '24 Hours',
    medicines: ['Insulin', 'Metformin', 'Glimepiride', 'Sitagliptin', 'Empagliflozin', 'Linagliptin'],
  },
  {
    id: 5, name: '1mg Store', address: 'Jubilee Hills, Hyderabad',
    lat: 17.4326, lng: 78.4071, rating: 4.4, open: true,
    phone: '+91 40 5678 9012', hours: '8AM - 10PM',
    medicines: ['Paracetamol', 'Azithromycin', 'Hydroxychloroquine', 'Montelukast', 'Levothyroxine'],
  },
  {
    id: 6, name: 'Wellness Forever', address: 'Salt Lake, Kolkata',
    lat: 22.5726, lng: 88.4341, rating: 4.3, open: true,
    phone: '+91 33 6789 0123', hours: '9AM - 9PM',
    medicines: ['Aspirin', 'Clopidogrel', 'Warfarin', 'Rivaroxaban', 'Enoxaparin', 'Heparin'],
  },
  {
    id: 7, name: 'Medisave Pharmacy', address: 'Aundh, Pune',
    lat: 18.5679, lng: 73.8143, rating: 4.6, open: true,
    phone: '+91 20 7890 1234', hours: '8AM - 11PM',
    medicines: ['Methotrexate', 'Prednisolone', 'Hydroxychloroquine', 'Sulfasalazine', 'Leflunomide'],
  },
  {
    id: 8, name: 'Jan Aushadhi Kendra', address: 'Sector 22, Chandigarh',
    lat: 30.7333, lng: 76.7794, rating: 4.2, open: true,
    phone: '+91 172 2345 678', hours: '9AM - 6PM',
    medicines: ['Metformin', 'Amlodipine', 'Atenolol', 'Furosemide', 'Spironolactone'],
  },
]

export default function PharmacyFinder() {
  const [search, setSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = useMemo(() => pharmacies.filter(p => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
    const matchMed = !medSearch || p.medicines.some(m =>
      m.toLowerCase().includes(medSearch.toLowerCase()))
    return matchName && matchMed
  }), [search, medSearch])

  const selected = pharmacies.find(p => p.id === selectedId)
  const center: [number, number] = selected ? [selected.lat, selected.lng] : [20.5937, 78.9629]

  return (
    <div className="flex flex-col lg:flex-row h-screen" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div className="w-full lg:w-[400px] flex flex-col" style={{ borderRight: '1px solid var(--border)' }}>
        <div className="p-4 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(186,117,23,0.2)' }}>
              <Pill className="w-4 h-4" style={{ color: 'var(--amber)' }} />
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Pharmacy Finder</h1>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>Find medicines & pharmacies near you</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search pharmacies or cities..."
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="relative">
            <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text3)' }} />
            <input value={medSearch} onChange={e => setMedSearch(e.target.value)}
              placeholder="Search specific medicine (e.g. Insulin)..."
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
            {filtered.length} pharmacies found
            {medSearch && ` · Searching for "${medSearch}"`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text2)' }}>No pharmacies found</p>
            </div>
          ) : (
            filtered.map(p => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                className="p-4 cursor-pointer transition-all"
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: selectedId === p.id ? 'rgba(0,200,160,0.05)' : 'transparent',
                  borderLeft: selectedId === p.id ? '3px solid var(--teal)' : '3px solid transparent',
                }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{p.name}</h3>
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text2)' }}>
                      <MapPin className="w-3 h-3" />{p.address}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                    style={{
                      background: p.open ? 'rgba(29,158,117,0.12)' : 'rgba(216,90,48,0.12)',
                      color: p.open ? '#0F6E56' : '#993C1D',
                    }}>
                    {p.open ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {p.open ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--text3)' }}>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                    {p.rating}
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.hours}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.medicines.map(m => (
                    <span key={m} className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: medSearch && m.toLowerCase().includes(medSearch.toLowerCase())
                          ? 'rgba(0,200,160,0.2)' : 'var(--surface2)',
                        color: medSearch && m.toLowerCase().includes(medSearch.toLowerCase())
                          ? 'var(--teal-bright)' : 'var(--text2)',
                        fontWeight: medSearch && m.toLowerCase().includes(medSearch.toLowerCase()) ? '600' : '400',
                      }}>
                      {m}
                    </span>
                  ))}
                </div>
                {selectedId === p.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-3 pt-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <a href={`tel:${p.phone}`}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-white"
                      style={{ background: 'var(--gradient-primary)' }}>
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
                      style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}>
                      <MapPin className="w-3 h-3" /> Navigate
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1" style={{ minHeight: '400px' }}>
        <MapContainer center={center} zoom={selected ? 13 : 5}
          key={`${center[0]}-${center[1]}`} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]}
              icon={selectedId === p.id ? selectedIcon : pharmacyIcon}
              eventHandlers={{ click: () => setSelectedId(p.id) }}>
              <Popup>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '3px' }}>{p.name}</p>
                  <p style={{ color: '#666', marginBottom: '3px' }}>{p.address}</p>
                  <p style={{ color: p.open ? '#0F6E56' : '#993C1D' }}>
                    {p.open ? '● Open' : '● Closed'} · {p.hours}
                  </p>
                  <p style={{ color: '#888', fontSize: '11px', marginTop: '3px' }}>
                    ⭐ {p.rating} · {p.phone}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}