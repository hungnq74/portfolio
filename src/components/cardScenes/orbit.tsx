"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const BODIES = [
  { radius: 1.05, speed: 0.85, tilt: 0.2, size: 0.13 },
  { radius: 1.55, speed: -0.55, tilt: -0.5, size: 0.1 },
  { radius: 2.0, speed: 0.36, tilt: 0.75, size: 0.16 },
]
const TRAIL = 70

/**
 * Cosmoagents — agents on their own paths around one centre.
 * Technique: line trails. Each body writes its history into a line buffer, so
 * the drawing is a record of motion rather than a static shape.
 */
export function OrbitScene({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null)
  const bodies = useRef<(THREE.Mesh | null)[]>([])
  const trails = useRef<(THREE.BufferAttribute | null)[]>([])

  const buffers = useMemo(
    () => BODIES.map(() => new Float32Array(TRAIL * 3)),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime

    BODIES.forEach((body, index) => {
      const angle = t * body.speed
      const x = Math.cos(angle) * body.radius
      const z = Math.sin(angle) * body.radius
      const y = Math.sin(angle * 1.6) * body.tilt

      const mesh = bodies.current[index]
      if (mesh) mesh.position.set(x, y, z)

      // Shift the trail down one slot and write the newest point at the head.
      const buffer = buffers[index]
      buffer.copyWithin(0, 3)
      buffer[(TRAIL - 1) * 3] = x
      buffer[(TRAIL - 1) * 3 + 1] = y
      buffer[(TRAIL - 1) * 3 + 2] = z
      const attribute = trails.current[index]
      if (attribute) attribute.needsUpdate = true
    })

    if (group.current) group.current.rotation.y = t * 0.1
  })

  return (
    <group ref={group} rotation={[0.5, 0, 0.15]}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>

      {BODIES.map((body, index) => (
        <group key={body.radius}>
          <mesh ref={(node) => { bodies.current[index] = node }}>
            <sphereGeometry args={[body.size, 20, 20]} />
            <meshStandardMaterial color={accent} roughness={0.35} metalness={0.2} />
          </mesh>
          <line>
            <bufferGeometry>
              <bufferAttribute
                ref={(node) => { trails.current[index] = node }}
                attach="attributes-position"
                args={[buffers[index], 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color={accent} transparent opacity={0.42} />
          </line>
        </group>
      ))}
    </group>
  )
}
