"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { MeshDistortMaterial } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"
import type { Project } from "@/lib/projects"

type Lens = Project["visual"]["lens"]

/**
 * One sphere, nine readings of it. Segment count decides whether the form is
 * faceted or smooth, distortion decides how far it strays from a ball, and the
 * scale gives each lens its own silhouette — so the cards share a language
 * without any two looking alike.
 */
const LENS_3D: Record<
  Lens,
  { distort: number; speed: number; segments: number; scale: [number, number, number]; roughness: number }
> = {
  drop:    { distort: 0.34, speed: 1.3, segments: 96, scale: [0.92, 1.16, 0.92], roughness: 0.08 },
  petal:   { distort: 0.46, speed: 1.1, segments: 96, scale: [1.12, 0.88, 0.9],  roughness: 0.16 },
  leaf:    { distort: 0.3,  speed: 0.9, segments: 96, scale: [1.24, 0.78, 0.7],  roughness: 0.2  },
  heart:   { distort: 0.42, speed: 1.5, segments: 96, scale: [1.05, 1.0, 1.0],   roughness: 0.12 },
  orbit:   { distort: 0.2,  speed: 2.1, segments: 64, scale: [1.0, 1.0, 1.0],    roughness: 0.1  },
  ripple:  { distort: 0.16, speed: 2.6, segments: 128, scale: [1.1, 1.1, 0.72],  roughness: 0.06 },
  blossom: { distort: 0.55, speed: 1.0, segments: 96, scale: [1.02, 1.02, 1.02], roughness: 0.22 },
  terrain: { distort: 0.38, speed: 0.6, segments: 48, scale: [1.18, 0.82, 1.0],  roughness: 0.42 },
  network: { distort: 0.26, speed: 1.2, segments: 12, scale: [1.0, 1.0, 1.0],    roughness: 0.3  },
}

function Orb({ lens, accent }: { lens: Lens; accent: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const config = LENS_3D[lens]

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.y = t * 0.22
    mesh.current.rotation.x = Math.sin(t * 0.35) * 0.18
    mesh.current.position.y = Math.sin(t * 0.6) * 0.06
  })

  return (
    <mesh ref={mesh} scale={config.scale}>
      <sphereGeometry args={[1, config.segments, config.segments]} />
      <MeshDistortMaterial
        color={accent}
        distort={config.distort}
        speed={config.speed}
        roughness={config.roughness}
        metalness={0.12}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}

export function ProjectOrb({ lens, accent }: { lens: Lens; accent: string }) {
  return (
    <Canvas
      className="pointer-events-none"
      dpr={[1, 1.5]}
      // alpha so the orb sits inside the card's glass panel rather than
      // punching an opaque hole through it
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 3.4], fov: 45 }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[2, 3, 4]} intensity={1.7} />
      <directionalLight position={[-3, -2, 1]} intensity={0.55} />
      <Orb lens={lens} accent={accent} />
    </Canvas>
  )
}

export default ProjectOrb
