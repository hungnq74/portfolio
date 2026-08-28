"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const COUNT = 60

/**
 * Curate — a lot passing through, a little kept.
 * Technique: instanced geometry on a wrapping flow field. Unlike the bloom,
 * nothing here is placed by rule; petals enter, drift, and re-enter.
 */
export function DriftScene({ accent }: { accent: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, -0.5)
    shape.bezierCurveTo(0.42, -0.16, 0.34, 0.42, 0, 0.6)
    shape.bezierCurveTo(-0.34, 0.42, -0.42, -0.16, 0, -0.5)
    return new THREE.ShapeGeometry(shape, 12)
  }, [])

  const seeds = useMemo(() => {
    let value = 991
    const random = () => {
      value = (value * 1664525 + 1013904223) % 4294967296
      return value / 4294967296
    }
    return Array.from({ length: COUNT }, () => ({
      x: (random() - 0.5) * 4.4,
      y: (random() - 0.5) * 4.4,
      z: (random() - 0.5) * 1.8,
      phase: random() * Math.PI * 2,
      rate: 0.6 + random() * 0.9,
      size: 0.6 + random() * 0.7,
    }))
  }, [])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    const span = 4.4

    seeds.forEach((seed, i) => {
      let y = seed.y + t * 0.28 * seed.rate
      y = ((((y + span / 2) % span) + span) % span) - span / 2
      dummy.position.set(seed.x + Math.sin(t * 0.5 * seed.rate + seed.phase) * 0.5, y, seed.z)
      dummy.rotation.set(seed.phase + t * 0.3 * seed.rate, t * 0.4 * seed.rate, seed.phase)
      dummy.scale.setScalar(0.19 * seed.size)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, COUNT]}>
      <meshStandardMaterial
        color={accent}
        roughness={0.86}
        side={THREE.DoubleSide}
        transparent
        opacity={0.82}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
