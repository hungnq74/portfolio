"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const COUNT = 7

/**
 * VNGGames CS — one request, then the widening consequence of it.
 * Technique: instanced meshes on a staggered clock. Seven rings share one draw
 * call; each is simply further along the same cycle.
 */
export function RingScene({ accent }: { accent: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime

    for (let i = 0; i < COUNT; i += 1) {
      const phase = (t * 0.28 + i / COUNT) % 1
      const scale = 0.25 + phase * 2.3
      dummy.position.set(0, 0, -phase * 0.9)
      dummy.rotation.set(-1.15, 0, phase * 0.6)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <torusGeometry args={[1, 0.022, 12, 96]} />
      <meshStandardMaterial
        color={accent}
        emissive={accent}
        emissiveIntensity={0.35}
        roughness={0.4}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
