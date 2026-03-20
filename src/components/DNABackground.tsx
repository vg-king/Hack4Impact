import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { Group, InstancedMesh } from 'three'
import { Object3D } from 'three'

type Point3 = [number, number, number]

const DNA_SETTINGS = {
  rungCount: 52,
  radius: 1.8,
  pitch: 0.28,
  twistStep: 0.45,
  flowParticlesPerStrand: 12,
}

const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha

function pointOnStrand(progress: number, strand: 'a' | 'b'): Point3 {
  const normalized = ((progress % 1) + 1) % 1
  const index = normalized * (DNA_SETTINGS.rungCount - 1)
  const y = (index - DNA_SETTINGS.rungCount / 2) * DNA_SETTINGS.pitch
  const angle = index * DNA_SETTINGS.twistStep + (strand === 'b' ? Math.PI : 0)

  return [
    Math.cos(angle) * DNA_SETTINGS.radius,
    y,
    Math.sin(angle) * DNA_SETTINGS.radius,
  ]
}

function hasWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  const canvas = document.createElement('canvas')
  const context =
    canvas.getContext('webgl2') ||
    canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl')

  return Boolean(context)
}

function FlowingParticles({ strand, speed }: { strand: 'a' | 'b'; speed: number }) {
  const meshRef = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const offsets = useMemo(
    () =>
      Array.from(
        { length: DNA_SETTINGS.flowParticlesPerStrand },
        (_, idx) => idx / DNA_SETTINGS.flowParticlesPerStrand,
      ),
    [],
  )

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const t = state.clock.elapsedTime
    offsets.forEach((offset, idx) => {
      const progress = offset + t * speed
      const [x, y, z] = pointOnStrand(progress, strand)
      const scale = 0.03 + 0.012 * (0.5 + 0.5 * Math.sin((t + offset * 8) * 3.2))

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(idx, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DNA_SETTINGS.flowParticlesPerStrand]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={strand === 'a' ? '#8bffe9' : '#47ffd4'}
        emissive={strand === 'a' ? '#38f7cc' : '#14d2a7'}
        emissiveIntensity={1.15}
        transparent
        opacity={0.14}
        roughness={0.25}
        metalness={0.1}
      />
    </instancedMesh>
  )
}

function DNAHelix() {
  const driftRef = useRef<Group>(null)
  const helixRef = useRef<Group>(null)

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

      const p1: Point3 = [x1, y, z1]
      const p2: Point3 = [x2, y, z2]

      strandA.push(p1)
      strandB.push(p2)
      rungs.push([p1, p2])

      if (i % 2 === 0) {
        atoms.push([
          x1 * 0.9 + Math.sin(angle * 0.7) * 0.18,
          y,
          z1 * 0.9 + Math.cos(angle * 0.6) * 0.18,
        ])
        atoms.push([
          x2 * 0.9 + Math.cos(angle * 0.8) * 0.18,
          y,
          z2 * 0.9 + Math.sin(angle * 0.5) * 0.18,
        ])
      }
    }

    return { strandA, strandB, rungs, atoms }
  }, [])

  useFrame((state, delta) => {
    if (!helixRef.current || !driftRef.current) return

    const t = state.clock.elapsedTime
    const pointerX = state.pointer.x
    const pointerY = state.pointer.y

    helixRef.current.rotation.y += delta * 0.12
    helixRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.035)

    driftRef.current.rotation.x = lerp(
      driftRef.current.rotation.x,
      Math.sin(t * 0.25) * 0.05 + pointerY * 0.12,
      0.03,
    )
    driftRef.current.rotation.z = lerp(
      driftRef.current.rotation.z,
      -pointerX * 0.12,
      0.03,
    )
    driftRef.current.position.y = Math.sin(t * 0.55) * 0.16
  })

  return (
    <group ref={driftRef}>
      <group ref={helixRef}>
        <Line
          points={strandA}
          color="#4dffd2"
          transparent
          opacity={0.12}
          lineWidth={1}
        />
        <Line
          points={strandB}
          color="#00f5c4"
          transparent
          opacity={0.12}
          lineWidth={1}
        />

        {rungs.map(([a, b], idx) => (
          <Line
            key={`rung-${idx}`}
            points={[a, b]}
            color="#7dffe5"
            transparent
            opacity={0.08}
            lineWidth={0.6}
          />
        ))}

        {atoms.map((position, idx) => (
          <mesh key={`atom-${idx}`} position={position}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={idx % 3 === 0 ? '#89ffe9' : '#2cffc3'}
              emissive={idx % 3 === 0 ? '#49f7cf' : '#17d6a7'}
              emissiveIntensity={0.9}
              transparent
              opacity={0.12}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        ))}

        <FlowingParticles strand="a" speed={0.075} />
        <FlowingParticles strand="b" speed={-0.085} />
      </group>
    </group>
  )
}

export default function DNABackground() {
  const [webglSupported, setWebglSupported] = useState(false)

  useEffect(() => {
    setWebglSupported(hasWebGLSupport())
  }, [])

  if (!webglSupported) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 20% 15%, rgba(15, 179, 152, 0.18), transparent 45%), radial-gradient(circle at 75% 70%, rgba(22, 204, 170, 0.12), transparent 40%), linear-gradient(145deg, #02131a, #041820 55%, #03161f)',
        }}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight color="#63ffe0" intensity={0.3} />
        <pointLight position={[5, 4, 4]} color="#6affdf" intensity={1.4} />
        <pointLight position={[-5, -4, -2]} color="#1ecaa6" intensity={0.8} />
        <DNAHelix />
      </Canvas>
    </div>
  )
}