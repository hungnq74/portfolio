"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import type { Project } from "@/lib/projects"

type Lens = Project["visual"]["lens"]

/**
 * The landscape behind these cards already has petals drifting through it.
 * Rather than drop a foreign object on top, each card gets its own drift —
 * same air, tinted with the accent the card already carries.
 *
 * One mechanism, nine flows: `rise` sets which way the air moves, `swirl` how
 * much it turns around the centre, `sway` the width of the wander, and count
 * and scale decide whether the card reads as sparse or full.
 */
const LENS_FLOW: Record<
  Lens,
  { count: number; rise: number; swirl: number; sway: number; scale: number; spin: number; spread: number }
> = {
  drop:    { count: 46, rise: -0.30, swirl: 0.05, sway: 0.34, scale: 0.14, spin: 0.5, spread: 1.5 },
  petal:   { count: 54, rise:  0.18, swirl: 0.10, sway: 0.52, scale: 0.17, spin: 0.7, spread: 1.7 },
  leaf:    { count: 30, rise: -0.16, swirl: 0.07, sway: 0.62, scale: 0.26, spin: 0.9, spread: 1.8 },
  heart:   { count: 44, rise:  0.24, swirl: 0.08, sway: 0.40, scale: 0.16, spin: 0.4, spread: 1.6 },
  orbit:   { count: 40, rise:  0.04, swirl: 0.52, sway: 0.16, scale: 0.13, spin: 1.1, spread: 1.9 },
  ripple:  { count: 64, rise:  0.06, swirl: 0.30, sway: 0.22, scale: 0.10, spin: 0.6, spread: 2.0 },
  blossom: { count: 72, rise:  0.22, swirl: 0.16, sway: 0.58, scale: 0.15, spin: 0.8, spread: 1.9 },
  terrain: { count: 34, rise:  0.05, swirl: 0.03, sway: 0.78, scale: 0.22, spin: 0.3, spread: 2.1 },
  network: { count: 26, rise:  0.09, swirl: 0.12, sway: 0.28, scale: 0.11, spin: 0.5, spread: 1.7 },
}

// Deterministic scatter, so a card looks the same every time it comes forward.
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function petalGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, -0.5)
  shape.bezierCurveTo(0.42, -0.16, 0.34, 0.42, 0, 0.6)
  shape.bezierCurveTo(-0.34, 0.42, -0.42, -0.16, 0, -0.5)
  return new THREE.ShapeGeometry(shape, 12)
}

function Drift({ lens, accent }: { lens: Lens; accent: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const flow = LENS_FLOW[lens]
  const geometry = useMemo(petalGeometry, [])

  const seeds = useMemo(() => {
    const random = seeded(lens.length * 9871 + flow.count * 131)
    return Array.from({ length: flow.count }, () => ({
      x: (random() - 0.5) * 2 * flow.spread,
      y: (random() - 0.5) * 2 * flow.spread,
      z: (random() - 0.5) * 1.6,
      phase: random() * Math.PI * 2,
      rate: 0.6 + random() * 0.9,
      tilt: random() * Math.PI,
      size: 0.65 + random() * 0.7,
    }))
  }, [lens, flow])

  // Depth by tint: petals further back sit paler, the way haze works. These are
  // brightness multipliers over the material colour, not colours in their own
  // right — so if instancing colour is unavailable the petals simply come out
  // flat accent rather than wrong.
  const shades = useMemo(() => {
    const array = new Float32Array(flow.count * 3)
    seeds.forEach((seed, i) => {
      const lift = 0.86 + (seed.z + 0.8) * 0.42
      array[i * 3] = lift
      array[i * 3 + 1] = lift
      array[i * 3 + 2] = lift
    })
    return array
  }, [seeds, flow.count])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const span = flow.spread * 2

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime

    seeds.forEach((seed, i) => {
      // Drift along the air, wrapping so the flow never runs dry.
      let y = seed.y + t * flow.rise * seed.rate
      y = ((((y + flow.spread) % span) + span) % span) - flow.spread

      const wander = Math.sin(t * 0.45 * seed.rate + seed.phase) * flow.sway
      const angle = t * flow.swirl * seed.rate
      const x = seed.x + wander
      dummy.position.set(
        x * Math.cos(angle) - y * Math.sin(angle) * 0.35,
        y * Math.cos(angle) + x * Math.sin(angle) * 0.35,
        seed.z,
      )

      dummy.rotation.set(
        seed.tilt + t * flow.spin * 0.35 * seed.rate,
        t * flow.spin * 0.5 * seed.rate,
        seed.phase + t * flow.spin * 0.2,
      )
      dummy.scale.setScalar(flow.scale * seed.size)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })

    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, flow.count]}>
      <instancedBufferAttribute attach="instanceColor" args={[shades, 3]} />
      <meshStandardMaterial
        color={accent}
        roughness={0.86}
        metalness={0}
        transparent
        opacity={0.82}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

export function ProjectPetals({ lens, accent }: { lens: Lens; accent: string }) {
  return (
    <Canvas
      className="pointer-events-none"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} />
      <directionalLight position={[-2, -1, 2]} intensity={0.5} />
      <Drift lens={lens} accent={accent} />
    </Canvas>
  )
}

export default ProjectPetals
