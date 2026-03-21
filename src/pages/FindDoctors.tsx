import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Star, Phone, Clock, Search } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const createIcon = (color: string) =>
  new L.DivIcon({
    className: '',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })

const tealIcon = createIcon('hsl(168,80%,36%)')
const coralIcon = createIcon('hsl(340,75%,55%)')

const specializations = ['All','Cardiologist','Neurologist','Orthopedic','Dermatologist','Oncologist','Pediatrician','Ophthalmologist','General Surgeon','Psychiatrist','Gastroenterologist']

const doctors = [
  { id:1, name:'Dr. Rajesh Kumar', spec:'Cardiologist', hospital:'AIIMS Delhi', rating:4.9, reviews:2847, phone:'+91 98765 43210', lat:28.5672, lng:77.2100, city:'New Delhi', experience:'25 yrs', fee:'₹1,500', available:true },
  { id:2, name:'Dr. Priya Sharma', spec:'Neurologist', hospital:'Fortis Hospital', rating:4.8, reviews:1923, phone:'+91 87654 32109', lat:28.4595, lng:77.0266, city:'Gurugram', experience:'18 yrs', fee:'₹1,200', available:true },
  { id:3, name:'Dr. Amit Patel', spec:'Orthopedic', hospital:'Apollo Hospital', rating:4.7, reviews:3156, phone:'+91 76543 21098', lat:13.0827, lng:80.2707, city:'Chennai', experience:'22 yrs', fee:'₹1,000', available:false },
  { id:4, name:'Dr. Sneha Reddy', spec:'Dermatologist', hospital:'Max Hospital', rating:4.9, reviews:1567, phone:'+91 65432 10987', lat:17.3850, lng:78.4867, city:'Hyderabad', experience:'15 yrs', fee:'₹800', available:true },
  { id:5, name:'Dr. Vikram Singh', spec:'Oncologist', hospital:'Tata Memorial', rating:4.8, reviews:4231, phone:'+91 54321 09876', lat:19.0044, lng:72.8435, city:'Mumbai', experience:'28 yrs', fee:'₹2,000', available:true },
  { id:6, name:'Dr. Ananya Gupta', spec:'Pediatrician', hospital:'Rainbow Children', rating:4.7, reviews:1890, phone:'+91 43210 98765', lat:12.9716, lng:77.5946, city:'Bangalore', experience:'12 yrs', fee:'₹700', available:true },
  { id:7, name:'Dr. Ravi Menon', spec:'General Surgeon', hospital:'CMC Vellore', rating:4.9, reviews:5012, phone:'+91 32109 87654', lat:12.9165, lng:79.1325, city:'Vellore', experience:'30 yrs', fee:'₹1,800', available:true },
  { id:8, name:'Dr. Kavita Joshi', spec:'Psychiatrist', hospital:'NIMHANS', rating:4.8, reviews:2134, phone:'+91 21098 76543', lat:12.9432, lng:77.5965, city:'Bangalore', experience:'20 yrs', fee:'₹1,100', available:true },
  { id:9, name:'Dr. Sanjay Mehta', spec:'Cardiologist', hospital:'Medanta Hospital', rating:4.9, reviews:3789, phone:'+91 10987 65432', lat:28.4400, lng:77.0415, city:'Gurugram', experience:'35 yrs', fee:'₹2,500', available:true },
  { id:10, name:'Dr. Meera Iyer', spec:'Ophthalmologist', hospital:'Sankara Nethralaya', rating:4.8, reviews:2567, phone:'+91 09876 54321', lat:13.0569, lng:80.2425, city:'Chennai', experience:'16 yrs', fee:'₹900', available:true },
]

export default function FindDoctors() {
  const [search, setSearch] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('All')
  const [selectedDoctor, setSelectedDoctor] = useState<number|null>(null)
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [doctorComments, setDoctorComments] = useState<Record<number, string[]>>({})

  const handleAddComment = (doctorId: number) => {
    const text = (commentInputs[doctorId] || '').trim()
    if (!text) return

    setDoctorComments((prev) => ({
      ...prev,
      [doctorId]: [...(prev[doctorId] || []), text],
    }))
    setCommentInputs((prev) => ({ ...prev, [doctorId]: '' }))
  }

  const filtered = useMemo(() => doctors.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase())
    const matchSpec = selectedSpec === 'All' || d.spec === selectedSpec
    return matchSearch && matchSpec
  }), [search, selectedSpec])

  const selected = doctors.find(d => d.id === selectedDoctor)
  const center: [number, number] = selected ? [selected.lat, selected.lng] : [20.5937, 78.9629]

  return (
    <div className="flex flex-col lg:flex-row h-screen" style={{ background: 'var(--bg)' }}>
      <div className="w-full lg:w-[420px] flex flex-col" style={{ borderRight: '1px solid var(--border)' }}>
        <div className="p-5 space-y-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.2)' }}>
              <MapPin className="w-5 h-5" style={{ color: 'var(--emerald)' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Find Top Doctors</h1>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>Best specialists across India</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text3)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors, hospitals, cities..."
              className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {specializations.map((s) => (
              <button key={s} onClick={() => setSelectedSpec(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: selectedSpec === s ? 'var(--gradient-primary)' : 'var(--surface)',
                  color: selectedSpec === s ? 'white' : 'var(--text2)',
                  border: `1px solid ${selectedSpec === s ? 'transparent' : 'var(--border)'}`,
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((doc) => (
            <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setSelectedDoctor(doc.id === selectedDoctor ? null : doc.id)}
              className="p-4 cursor-pointer transition-all"
              style={{
                borderBottom: '1px solid var(--border)',
                background: selectedDoctor === doc.id ? 'rgba(0,200,160,0.05)' : 'transparent',
                borderLeft: selectedDoctor === doc.id ? '3px solid var(--teal)' : '3px solid transparent',
              }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{doc.name}</h3>
                  <p className="text-sm font-medium" style={{ color: 'var(--teal)' }}>{doc.spec}</p>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>{doc.hospital}, {doc.city}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text3)' }}>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                      {doc.rating} ({doc.reviews.toLocaleString()})
                    </span>
                    <span>{doc.experience}</span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{doc.fee}</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: doc.available ? 'rgba(52,211,153,0.15)' : 'rgba(240,80,100,0.15)',
                    color: doc.available ? 'var(--emerald)' : 'var(--coral)',
                  }}>
                  {doc.available ? '● Available' : '● Busy'}
                </span>
              </div>
              {selectedDoctor === doc.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 pt-3 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex gap-2">
                    <a href={`tel:${doc.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium text-white"
                      style={{ background: 'var(--gradient-primary)' }}>
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
                      style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}>
                      <Clock className="w-3 h-3" /> Book Slot
                    </button>
                  </div>

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg p-3"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Patient comments</p>

                    {(doctorComments[doc.id] || []).length > 0 ? (
                      <div className="space-y-1.5 mb-3 max-h-28 overflow-y-auto pr-1">
                        {(doctorComments[doc.id] || []).map((comment, idx) => (
                          <p key={`${doc.id}-comment-${idx}`} className="text-xs px-2 py-1.5 rounded"
                            style={{ background: 'rgba(0,200,160,0.06)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                            {comment}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>No comments yet. Be the first to add one.</p>
                    )}

                    <div className="flex gap-2">
                      <input
                        value={commentInputs[doc.id] || ''}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddComment(doc.id)
                          }
                        }}
                        placeholder="Write your comment..."
                        className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(doc.id)}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-white"
                        style={{ background: 'var(--gradient-primary)' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        <MapContainer center={center} zoom={selected ? 12 : 5} className="h-full w-full"
          key={`${center[0]}-${center[1]}`} style={{ height: '100%' }}>
          <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map((doc) => (
            <Marker key={doc.id} position={[doc.lat, doc.lng]}
              icon={selectedDoctor === doc.id ? coralIcon : tealIcon}>
              <Popup>
                <div className="text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                  <p className="font-bold">{doc.name}</p>
                  <p style={{ color: 'hsl(168,80%,36%)' }}>{doc.spec}</p>
                  <p>{doc.hospital}</p>
                  <p>⭐ {doc.rating} · {doc.fee}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}