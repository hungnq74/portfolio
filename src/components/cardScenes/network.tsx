"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const NODES = 26
const REACH = 1.25

/**
 * WeShare — the value is in what connects, not the nodes.
 * Technique: a line-segment graph rebuilt every frame. Edges are not authored;
 * they appear and vanish as drifting nodes come within reach of each other.
 */
export function NetworkScene({ accent }: { accent: string }) {
  const nodesRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

  const { nodePositions, seeds, edgeBuffer } = useMemo(() => {
    const nodePositions = new Float32Array(NODES * 3)
    const seeds: { x: number; y: number; z: number; phase: number; rate: number }[] = []
    let value = 20240824
    const random = () => {
      value = (value * 1664525 + 1013904223) % 4294967296
      return value / 4294967296
    }
    for (let i = 0; i < NODES; i += 1) {
      const seed = {
        x: (random() - 0.5) * 3.4,
        y: (random() - 0.5) * 3.4,
        z: (random() - 0.5) * 1.6,
        phase: random() * Math.PI * 2,
        rate: 0.4 + random() * 0.8,
      }
      seeds.push(seed)
      nodePositions.set([seed.x, seed.y, seed.z], i * 3)
    }
    // Worst case every pair connects, so the buffer is sized for it once.
    const edgeBuffer = new Float32Array(NODES * NODES * 3)
    return { nodePositions, seeds, edgeBuffer }
  }, [])

  useFrame((state) => {
    const nodeAttribute = nodesRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined
    const lineGeometry = linesRef.current?.geometry
    if (!nodeAttribute || !lineGeometry) return

    const t = state.clock.elapsedTime
    seeds.forEach((seed, i) => {
      nodeAttribute.setXYZ(
        i,
        seed.x + Math.sin(t * 0.35 * seed.rate + seed.phase) * 0.42,
        seed.y + Math.cos(t * 0.28 * seed.rate + seed.phase) * 0.42,
        seed.z + Math.sin(t * 0.2 + seed.phase) * 0.3,
      )
    })
    nodeAttribute.needsUpdate = true

    let cursor = 0
    for (let a = 0; a < NODES; a += 1) {
      for (let b = a + 1; b < NODES; b += 1) {
        const dx = nodeAttribute.getX(a) - nodeAttribute.getX(b)
        const dy = nodeAttribute.getY(a) - nodeAttribute.getY(b)
        const dz = nodeAttribute.getZ(a) - nodeAttribute.getZ(b)
        if (dx * dx + dy * dy + dz * dz > REACH * REACH) continue
        edgeBuffer[cursor++] = nodeAttribute.getX(a)
        edgeBuffer[cursor++] = nodeAttribute.getY(a)
        edgeBuffer[cursor++] = nodeAttribute.getZ(a)
        edgeBuffer[cursor++] = nodeAttribute.getX(b)
        edgeBuffer[cursor++] = nodeAttribute.getY(b)
        edgeBuffer[cursor++] = nodeAttribute.getZ(b)
      }
    }

    const edgeAttribute = lineGeometry.attributes.position as THREE.BufferAttribute
    edgeAttribute.needsUpdate = true
    // Draw only the edges that exist this frame; the rest of the buffer is stale.
    lineGeometry.setDrawRange(0, cursor / 3)
  })

  return (
    <group rotation={[0.2, 0, 0]}>
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={accent} size={0.1} sizeAttenuation transparent opacity={0.95} depthWrite={false} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgeBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={accent} transparent opacity={0.3} />
      </lineSegments>
    </group>
  )
}
