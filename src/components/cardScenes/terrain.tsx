"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * Heritage Wander — ground travelled rather than looked at.
 * Technique: wireframe over a scrolling heightfield. The mesh is drawn as edges
 * only, and the landscape moves through it endlessly.
 */
export function TerrainScene({ accent }: { accent: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const rest = useRef<Float32Array | null>(null)

  const height = useMemo(
    () => (x: number, y: number) =>
      Math.sin(x * 1.1) * 0.32 +
      Math.cos(y * 0.9) * 0.28 +
      Math.sin((x + y) * 0.6) * 0.18,
    [],
  )

  useFrame((state) => {
    const geometry = mesh.current?.geometry as THREE.PlaneGeometry | undefined
    if (!geometry) return

    const position = geometry.attributes.position as THREE.BufferAttribute
    if (!rest.current) rest.current = Float32Array.from(position.array as Float32Array)

    const base = rest.current
    const drift = state.clock.elapsedTime * 0.45
    for (let i = 0; i < position.count; i += 1) {
      position.setZ(i, height(base[i * 3], base[i * 3 + 1] + drift))
    }
    position.needsUpdate = true
  })

  return (
    <mesh ref={mesh} rotation={[-1.15, 0, 0.2]} position={[0, -0.35, 0]}>
      <planeGeometry args={[6, 6, 44, 44]} />
      <meshBasicMaterial color={accent} wireframe transparent opacity={0.5} />
    </mesh>
  )
}
