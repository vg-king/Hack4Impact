import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { Group } from 'three'
import type { GenomicInsight } from '../../utils/genomicsInsights'
import ParticleFlow from './ParticleFlow'
import MutationHighlighter from './MutationHighlighter'

type Point3 = [number, number, number]

interface DNAModelProps {
  insights: GenomicInsight[]
  sequenceLength: number
  activeInsightId?: string
  onInsightFocus: (insight: GenomicInsight) => void
}

const DNA_SETTINGS = {
  rungCount: 64,
  radius: 1.65,
  pitch: 0.26,
  twistStep: 0.47,
}

const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha

export default function DNAModel({
  insights,
  sequenceLength,
  activeInsightId,
  onInsightFocus,
}: DNAModelProps) {
  const { camera } = useThree()
  const outerRef = useRef<Group>(null)
  const helixRef = useRef<Group>(null)

  const activeInsight = insights.find((insight) => insight.id === activeInsightId)
  const safeLength = Math.max(sequenceLength, 60)
  const activeProgress = activeInsight ? Math.max(0, Math.min(activeInsight.start / safeLength, 1)) : undefined
  const activeY = activeProgress !== undefined
    ? (activeProgress * (DNA_SETTINGS.rungCount - 1) - DNA_SETTINGS.rungCount / 2) * DNA_SETTINGS.pitch
    : 0

  const { strandA, strandB, rungs, atoms } = useMemo(() => {
    const strandA: Point3[] = []
    const strandB: Point3[] = []
    const rungs: [Point3, Point3][] = []
    const atoms: Point3[] = []

    for (let i = 0; i < DNA_SETTINGS.rungCount; i += 1) {
      const y = (i - DNA_SETTINGS.rungCount / 2) * DNA_SETTINGS.pitch
      const angle = i * DNA_SETTINGS.twistStep

      const x1 = Math.cos(angle) * DNA_SETTINGS.radius
      const z1 = Math.sin(angle) * DNA_SETTINGS.radius
      const x2 = Math.cos(angle + Math.PI) * DNA_SETTINGS.radius
      const z2 = Math.sin(angle + Math.PI) * DNA_SETTINGS.radius

      const leftPoint: Point3 = [x1, y, z1]
      const rightPoint: Point3 = [x2, y, z2]

      strandA.push(leftPoint)
      strandB.push(rightPoint)
      rungs.push([leftPoint, rightPoint])

      if (i % 2 === 0) {
        atoms.push([x1 * 0.92, y, z1 * 0.92])
        atoms.push([x2 * 0.92, y, z2 * 0.92])
      }
    }

    return { strandA, strandB, rungs, atoms }
  }, [])

  useFrame((state, delta) => {
    if (!helixRef.current || !outerRef.current) return
    const t = state.clock.elapsedTime
    const focusStrength = activeProgress !== undefined ? 0.2 : 0

    helixRef.current.rotation.y += delta * 0.14
    helixRef.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.03 + focusStrength * 0.12)

    outerRef.current.rotation.x = lerp(
      outerRef.current.rotation.x,
      Math.sin(t * 0.3) * 0.06 + state.pointer.y * 0.08,
      0.03,
    )
    outerRef.current.rotation.z = lerp(outerRef.current.rotation.z, -state.pointer.x * 0.08, 0.03)
    outerRef.current.position.y = lerp(
      outerRef.current.position.y,
      Math.sin(t * 0.45) * 0.18 - activeY * focusStrength,
      0.04,
    )

    const targetZ = activeProgress !== undefined ? 5.7 : 8
    const targetY = activeProgress !== undefined ? activeY * 0.26 : 0
    camera.position.z = lerp(camera.position.z, targetZ, 0.04)
    camera.position.y = lerp(camera.position.y, targetY, 0.04)
    camera.lookAt(0, targetY * 0.35, 0)
  })

  return (
    <group ref={outerRef}>
      <group ref={helixRef}>
        <Line points={strandA} color="#7bffe5" transparent opacity={0.2} lineWidth={1.3} />
        <Line points={strandB} color="#55ffd8" transparent opacity={0.2} lineWidth={1.3} />

        {rungs.map(([left, right], index) => (
          <Line
            key={`rung-${index}`}
            points={[left, right]}
            color="#8bffe9"
            transparent
            opacity={0.11}
            lineWidth={0.6}
          />
        ))}

        {atoms.map((position, index) => (
          <mesh key={`atom-${index}`} position={position}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#89ffe9' : '#4dffd2'}
              emissive={index % 2 === 0 ? '#38e7bd' : '#22cfaa'}
              emissiveIntensity={1.15}
              transparent
              opacity={0.2}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        ))}

        <ParticleFlow
          radius={DNA_SETTINGS.radius}
          rungCount={DNA_SETTINGS.rungCount}
          pitch={DNA_SETTINGS.pitch}
          twistStep={DNA_SETTINGS.twistStep}
          focusProgress={activeProgress}
          focusStrength={activeProgress !== undefined ? 0.42 : 0}
        />
        <MutationHighlighter
          insights={insights}
          sequenceLength={sequenceLength}
          rungCount={DNA_SETTINGS.rungCount}
          radius={DNA_SETTINGS.radius}
          pitch={DNA_SETTINGS.pitch}
          twistStep={DNA_SETTINGS.twistStep}
          selectedInsightId={activeInsightId}
          onInsightFocus={onInsightFocus}
        />
      </group>
    </group>
  )
}