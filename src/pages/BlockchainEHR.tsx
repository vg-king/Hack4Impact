import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Shield, Eye, CheckCircle, FileText, Key } from 'lucide-react'

const blocks = [
  { id: 2847, hash: '0x7f3a9b1c', prev: '0x4a2f8d...', data: 'Admission record', time: '20 Mar 09:14', verified: true },
  { id: 2848, hash: '0x9c1d4e2a', prev: '0x7f3a9b...', data: 'CBC lab results', time: '20 Mar 11:30', verified: true },
  { id: 2849, hash: '0x2b8f3d7c', prev: '0x9c1d4e...', data: 'Chest X-ray report', time: '20 Mar 14:22', verified: true },
  { id: 2850, hash: '0x5e1a9f4b', prev: '0x2b8f3d...', data: 'Prescription issued', time: '20 Mar 15:45', verified: true },
]

export default function BlockchainEHR() {
  const [showZK, setShowZK] = useState(false)

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-6 bg-grid">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(52,139,212,0.2)' }}>
            <Lock className="w-5 h-5" style={{ color: '#378ADD' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Blockchain EHR ledger
            </h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Patient-owned · Zero-knowledge proofs · FHIR R4 · Hyperledger Fabric
            </p>
          </div>
        </div>
      </motion.div>

      {/* Immutable chain visualization */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Immutable health record chain — Patient #A2847
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {blocks.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 rounded-lg p-3 min-w-[160px]"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1 mb-2">
                <Shield className="w-3 h-3" style={{ color: 'var(--teal)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  Block #{b.id}
                </span>
              </div>
              <p className="text-xs font-mono mb-1" style={{ color: 'var(--teal)' }}>{b.hash}</p>
              <p className="text-xs mb-1" style={{ color: 'var(--text)' }}>{b.data}</p>
              <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>prev: {b.prev}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>{b.time}</p>
              {b.verified && (
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-3 h-3" style={{ color: 'var(--emerald)' }} />
                  <span className="text-xs" style={{ color: 'var(--emerald)' }}>Verified</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Access control + ZK proof demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Granular access control
          </h2>
          {[
            { who: 'Dr. Rajesh Kumar', what: 'Full record access', status: 'active', color: '#1D9E75' },
            { who: 'AIIMS Delhi Lab', what: 'Lab results only', status: 'active', color: '#1D9E75' },
            { who: 'Insurance Corp', what: 'Eligibility only — no diagnoses', status: 'expires 30d', color: '#BA7517' },
            { who: 'Research Institute', what: 'Anonymized data only', status: 'pending consent', color: '#BA7517' },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{a.who}</p>
                <p className="text-xs" style={{ color: 'var(--text2)' }}>{a.what}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${a.color}20`, color: a.color }}>{a.status}</span>
            </div>
          ))}
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
              Zero-knowledge proof demo
            </h2>
            <button onClick={() => setShowZK(!showZK)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
              style={{ background: 'var(--gradient-primary)' }}>
              {showZK ? 'Hide proof' : 'Generate ZK proof'}
            </button>
          </div>
          {showZK && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg p-3 font-mono text-xs space-y-1"
              style={{ background: 'var(--surface2)', color: 'var(--teal)' }}>
              <p>Proof: pi_a = [0x3a9f..., 0x7c2b...]</p>
              <p>Proof: pi_b = [[0x1d8e..., 0x4f3a...]]</p>
              <p>Proof: pi_c = [0x9b2c..., 0x5e7f...]</p>
              <p style={{ color: 'var(--emerald)' }}>Public input: "patient is eligible" = TRUE</p>
              <p style={{ color: 'var(--text3)' }}>Private input: [diagnosis, history] = HIDDEN</p>
              <p style={{ color: 'var(--emerald)' }}>Verification: PASSED ✓</p>
            </motion.div>
          )}
          <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
            Insurers verify eligibility without ever seeing your diagnoses.
            Built on Groth16 ZK-SNARK protocol.
          </p>
        </div>
      </div>
    </div>
  )
}