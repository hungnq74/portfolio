"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * AI Hay — one surface carrying a lot of movement.
 * Technique: CPU-side geometry deformation. Each frame rewrites the position
 * attribute, so the ribbon bends as real geometry rather than a shader trick.
 */
export function RibbonScene({ accent }: { accent: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const rest = useRef<Float32Array | null>(null)

  useFrame((state) => {
    const geometry = mesh.current?.geometry as THREE.PlaneGeometry | undefined
    if (!geometry) return

    const position = geometry.attributes.position as THREE.BufferAttribute
    if (!rest.current) rest.current = Float32Array.from(position.array as Float32Array)

    const t = state.clock.elapsedTime
    const base = rest.current
    for (let i = 0; i < position.count; i += 1) {
      const x = base[i * 3]
      const y = base[i * 3 + 1]
      position.setZ(
        i,
        Math.sin(x * 1.4 + t * 1.2) * 0.42 * (0.35 + (x + 2.5) / 5) +
          Math.cos(y * 2.1 - t * 0.8) * 0.16,
      )
    }
    position.needsUpdate = true
    geometry.computeVertexNormals()

    if (mesh.current) mesh.current.rotation.z = Math.sin(t * 0.25) * 0.12
  })

  return (
    <mesh ref={mesh} rotation={[-0.4, 0.5, 0.2]}>
      <planeGeometry args={[5, 2.2, 64, 24]} />
      <meshStandardMaterial
        color={accent}
        roughness={0.42}
        metalness={0.1}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}
