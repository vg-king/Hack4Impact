import { motion } from 'framer-motion'
import { Activity, Bed, Users, AlertTriangle, Stethoscope, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import StatCard from '../components/StatCard'

const bedData = [
  { dept: 'ICU', occupied: 42, available: 8 },
  { dept: 'General', occupied: 156, available: 44 },
  { dept: 'Pediatric', occupied: 28, available: 12 },
  { dept: 'Maternity', occupied: 24, available: 6 },
  { dept: 'Emergency', occupied: 20, available: 5 },
  { dept: 'Surgery', occupied: 30, available: 5 },
]

const patientFlow = [
  { hour: '6AM', admissions: 8, discharges: 3 },
  { hour: '8AM', admissions: 15, discharges: 5 },
  { hour: '10AM', admissions: 22, discharges: 12 },
  { hour: '12PM', admissions: 18, discharges: 15 },
  { hour: '2PM', admissions: 12, discharges: 20 },
  { hour: '4PM', admissions: 10, discharges: 18 },
  { hour: '6PM', admissions: 14, discharges: 10 },
  { hour: '8PM', admissions: 8, discharges: 6 },
]

const deptLoad = [
  { name: 'Cardiology', value: 28, color: '#D85A30' },
  { name: 'Neurology', value: 18, color: '#1D9E75' },
  { name: 'Orthopedics', value: 22, color: '#BA7517' },
  { name: 'Oncology', value: 15, color: '#7F77DD' },
  { name: 'General', value: 17, color: '#378ADD' },
]

const physicians = [
  { name: 'Dr. R. Kumar', dept: 'Cardiology', status: 'On Duty', patients: 12, statusColor: '#1D9E75', statusBg: 'rgba(29,158,117,0.1)' },
  { name: 'Dr. P. Sharma', dept: 'Neurology', status: 'On Duty', patients: 8, statusColor: '#1D9E75', statusBg: 'rgba(29,158,117,0.1)' },
  { name: 'Dr. A. Patel', dept: 'Orthopedics', status: 'In Surgery', patients: 5, statusColor: '#BA7517', statusBg: 'rgba(186,117,23,0.1)' },
  { name: 'Dr. S. Reddy', dept: 'Oncology', status: 'On Duty', patients: 10, statusColor: '#1D9E75', statusBg: 'rgba(29,158,117,0.1)' },
  { name: 'Dr. V. Singh', dept: 'Emergency', status: 'On Break', patients: 0, statusColor: '#888', statusBg: 'var(--surface2)' },
  { name: 'Dr. M. Gupta', dept: 'Pediatrics', status: 'On Duty', patients: 15, statusColor: '#1D9E75', statusBg: 'rgba(29,158,117,0.1)' },
  { name: 'Dr. K. Joshi', dept: 'Psychiatry', status: 'On Duty', patients: 9, statusColor: '#1D9E75', statusBg: 'rgba(29,158,117,0.1)' },
]

const tooltipStyle = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }

export default function HospitalOps() {
  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Hospital Operations Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Real-time resource monitoring · AI bottleneck alerts · Live patient flow</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bed} label="Total beds" value="380" sub="21% free" color="var(--teal)" delay={0} />
        <StatCard icon={Users} label="Active patients" value="300" sub="+12 today" color="var(--emerald)" delay={0.05} />
        <StatCard icon={Stethoscope} label="Physicians on duty" value="42" sub="Live" color="var(--indigo)" delay={0.1} />
        <StatCard icon={AlertTriangle} label="ER queue" value="7" sub="~18 min wait" color="var(--coral)" delay={0.15} />
      </div>

      {/* AI Alert */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="rounded-xl p-4"
          style={{ background: 'rgba(216,90,48,0.06)', border: '1px solid rgba(216,90,48,0.3)', borderLeft: '4px solid #D85A30' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D85A30' }} />
            <p className="text-sm font-semibold" style={{ color: '#D85A30' }}>AI Predictive Alert — ICU surge predicted in 4 hours</p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text2)' }}>3 post-op patients in Ward 2B showing early deterioration signs. Recommend pre-emptive ICU bed reservation. Confidence: 84%.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bed Occupancy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>Bed occupancy by department</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,160,0.05)" />
              <XAxis type="number" fontSize={11} stroke="#3d7060" />
              <YAxis dataKey="dept" type="category" fontSize={11} stroke="#3d7060" width={72} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="occupied" fill="hsl(168,80%,36%)" radius={[0, 4, 4, 0]} name="Occupied" />
              <Bar dataKey="available" fill="rgba(0,200,160,0.15)" radius={[0, 4, 4, 0]} name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Load Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>Department load distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deptLoad} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} innerRadius={40} strokeWidth={0}>
                {deptLoad.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {deptLoad.map(d => (
              <span key={d.name} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text2)' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Patient Flow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>Patient flow — admissions vs discharges</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={patientFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,160,0.05)" />
              <XAxis dataKey="hour" fontSize={11} stroke="#3d7060" />
              <YAxis fontSize={11} stroke="#3d7060" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="admissions" stroke="hsl(168,80%,36%)" strokeWidth={2} dot={false} name="Admissions" />
              <Line type="monotone" dataKey="discharges" stroke="hsl(340,75%,55%)" strokeWidth={2} dot={false} name="Discharges" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Physician Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text)' }}>Physician status board</h2>
          <div className="space-y-2">
            {physicians.map(p => (
              <div key={p.name} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>{p.dept}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>
                    {p.patients > 0 ? `${p.patients} pts` : '—'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: p.statusBg, color: p.statusColor }}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* KPI Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Avg ER wait time', value: '18 min', sub: '↓ from 26 min', color: '#1D9E75' },
          { icon: TrendingUp, label: 'Bed utilisation', value: '79%', sub: 'Target: <85%', color: '#BA7517' },
          { icon: Activity, label: 'Avg length of stay', value: '4.2 days', sub: 'National avg: 5.1', color: '#1D9E75' },
          { icon: Users, label: 'Staff-patient ratio', value: '1:7', sub: 'WHO target: 1:5', color: '#BA7517' },
        ].map((k, i) => (
          <StatCard key={k.label} icon={k.icon} label={k.label} value={k.value} sub={k.sub} color={k.color} delay={0.05 * i} />
        ))}
      </div>
    </div>
  )
}