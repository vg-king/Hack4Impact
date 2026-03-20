import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { GenomicInsight } from '../../utils/genomicsInsights'

interface MutationHighlighterProps {
  insights: GenomicInsight[]
  sequenceLength: number
  rungCount: number
  radius: number
  pitch: number
  twistStep: number
  selectedInsightId?: string
  onInsightFocus: (insight: GenomicInsight) => void
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

function MutationVoxel({
  insight,
  sequenceLength,
  rungCount,
  radius,
  pitch,
  twistStep,
  selected,
  onFocus,
}: {
  insight: GenomicInsight
  sequenceLength: number
  rungCount: number
  radius: number
  pitch: number
  twistStep: number
  selected: boolean
  onFocus: (insight: GenomicInsight) => void
}) {
  const meshRef = useRef<Mesh>(null)
  const fragmentRefs = useRef<Array<Mesh | null>>([])

  const position = useMemo<[number, number, number]>(() => {
    const safeLength = Math.max(sequenceLength, 60)
    const ratio = clamp(insight.start / safeLength, 0, 1)
    const index = ratio * (rungCount - 1)
    const y = (index - rungCount / 2) * pitch
    const angle = index * twistStep
    const x = Math.cos(angle) * (radius * 0.58)
    const z = Math.sin(angle) * (radius * 0.58)
    return [x, y, z]
  }, [insight.start, pitch, radius, rungCount, sequenceLength, twistStep])

  const baseColor = insight.severity === 'high' ? '#4effd0' : insight.severity === 'moderate' ? '#66ffd8' : '#8dffe6'
  const emissive = insight.severity === 'high' ? '#29e0b3' : insight.severity === 'moderate' ? '#24cea8' : '#20b996'

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 2.4 + position[1]) * 0.08
    const selectedBoost = selected ? 0.2 : 0
    mesh.scale.setScalar(pulse + selectedBoost)
    mesh.position.x = position[0] + (selected ? Math.sin(t * 8.5 + position[1]) * 0.02 : 0)
    mesh.position.z = position[2] + (selected ? Math.cos(t * 7.2 + position[0]) * 0.02 : 0)

    const material = mesh.material
    if (Array.isArray(material)) return
    material.opacity = selected ? 0.28 : 0.18 + Math.abs(Math.sin(t * 1.9 + position[2])) * 0.05

    fragmentRefs.current.forEach((fragment, idx) => {
      if (!fragment) return
      const direction = idx % 2 === 0 ? 1 : -1
      const offset = selected ? 0.1 : 0.04
      fragment.position.x = direction * offset * Math.sin(t * (5 + idx) + position[0])
      fragment.position.y = direction * offset * Math.cos(t * (4 + idx) + position[1])
      fragment.position.z = direction * offset * Math.sin(t * (6 + idx) + position[2])
      fragment.scale.setScalar(selected ? 0.5 : 0.38)

      const fragmentMaterial = fragment.material
      if (Array.isArray(fragmentMaterial)) return
      fragmentMaterial.opacity = selected ? 0.22 : 0.12
    })
  })

  return (
    <group position={position} onPointerOver={() => onFocus(insight)} onClick={() => onFocus(insight)}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissive}
          emissiveIntensity={selected ? 1.6 : 1.1}
          transparent
          opacity={selected ? 0.28 : 0.2}
          roughness={0.45}
          metalness={0.2}
        />
      </mesh>

      {[0, 1, 2].map((fragmentIndex) => (
        <mesh
          key={`fragment-${fragmentIndex}`}
          ref={(node) => {
            fragmentRefs.current[fragmentIndex] = node
          }}
        >
          <boxGeometry args={[0.11, 0.11, 0.11]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emissive}
            emissiveIntensity={selected ? 1.3 : 0.9}
            transparent
            opacity={selected ? 0.22 : 0.12}
            roughness={0.45}
            metalness={0.25}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function MutationHighlighter({
  insights,
  sequenceLength,
  rungCount,
  radius,
  pitch,
  twistStep,
  selectedInsightId,
  onInsightFocus,
}: MutationHighlighterProps) {
  return (
    <group>
      {insights.map((insight) => (
        <MutationVoxel
          key={insight.id}
          insight={insight}
          sequenceLength={sequenceLength}
          rungCount={rungCount}
          radius={radius}
          pitch={pitch}
          twistStep={twistStep}
          selected={selectedInsightId === insight.id}
          onFocus={onInsightFocus}
        />
      ))}
    </group>
  )
}