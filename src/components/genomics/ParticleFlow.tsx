import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { InstancedMesh } from 'three'
import { Object3D } from 'three'

interface ParticleFlowProps {
  radius: number
  rungCount: number
  pitch: number
  twistStep: number
  focusProgress?: number
  focusStrength: number
}

const PARTICLES_PER_STRAND = 14

const pointOnStrand = (
  progress: number,
  strand: 'left' | 'right',
  radius: number,
  rungCount: number,
  pitch: number,
  twistStep: number,
): [number, number, number] => {
  const p = ((progress % 1) + 1) % 1
  const index = p * (rungCount - 1)
  const y = (index - rungCount / 2) * pitch
  const angle = index * twistStep + (strand === 'right' ? Math.PI : 0)
  return [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
}

function StrandFlow({
  strand,
  speed,
  color,
  emissive,
  radius,
  rungCount,
  pitch,
  twistStep,
  focusProgress,
  focusStrength,
}: {
  strand: 'left' | 'right'
  speed: number
  color: string
  emissive: string
  radius: number
  rungCount: number
  pitch: number
  twistStep: number
  focusProgress?: number
  focusStrength: number
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const offsets = useMemo(
    () => Array.from({ length: PARTICLES_PER_STRAND }, (_, idx) => idx / PARTICLES_PER_STRAND),
    [],
  )

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const t = state.clock.elapsedTime

    offsets.forEach((offset, idx) => {
      const driftProgress = offset + t * speed
      const focused = focusProgress !== undefined
      const progress = focused
        ? driftProgress + (focusProgress - driftProgress) * focusStrength
        : driftProgress
      const [x, y, z] = pointOnStrand(progress, strand, radius, rungCount, pitch, twistStep)
      const focusBoost = focused ? focusStrength * 0.018 : 0
      const scale = 0.024 + Math.abs(Math.sin((t + offset * 9) * 2.6)) * 0.02 + focusBoost

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(idx, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLES_PER_STRAND]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={1.05}
        transparent
        opacity={0.16}
        roughness={0.3}
        metalness={0.08}
      />
    </instancedMesh>
  )
}

export default function ParticleFlow(props: ParticleFlowProps) {
  return (
    <group>
      <StrandFlow
        strand="left"
        speed={0.08}
        color="#7fffe2"
        emissive="#39e7c0"
        {...props}
      />
      <StrandFlow
        strand="right"
        speed={-0.075}
        color="#55ffd5"
        emissive="#20d8ad"
        {...props}
      />
    </group>
  )
}