"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * Imely — many small signals breathing as one body.
 * Technique: a Points cloud. No meshes at all; every mark is a GPU point,
 * animated by rewriting the position buffer.
 */
export function CloudScene({ accent }: { accent: string }) {
  const points = useRef<THREE.Points>(null)
  const COUNT = 900

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const seeds = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i += 1) {
      // Fibonacci sphere, so the shell is evenly covered rather than clumped.
      const y = 1 - (i / (COUNT - 1)) * 2
      const radius = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = i * 2.399963
      seeds[i * 3] = Math.cos(theta) * radius
      seeds[i * 3 + 1] = y
      seeds[i * 3 + 2] = Math.sin(theta) * radius
    }
    positions.set(seeds)
    return { positions, seeds }
  }, [])

  useFrame((state) => {
    const geometry = points.current?.geometry
    if (!geometry) return
    const attribute = geometry.attributes.position as THREE.BufferAttribute
    const t = state.clock.elapsedTime

    for (let i = 0; i < COUNT; i += 1) {
      const x = seeds[i * 3]
      const y = seeds[i * 3 + 1]
      const z = seeds[i * 3 + 2]
      // A slow swell, plus a wobble that travels around the shell.
      const swell = 1.28 + Math.sin(t * 0.7) * 0.1 + Math.sin(y * 4 + t * 1.6) * 0.07
      attribute.setXYZ(i, x * swell, y * swell, z * swell)
    }
    attribute.needsUpdate = true
    points.current!.rotation.y = t * 0.16
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={accent}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
