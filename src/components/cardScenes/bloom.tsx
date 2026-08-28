"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const COUNT = 150
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/**
 * VNGGames Artian — many pieces arranged by one rule.
 * Technique: phyllotaxis. Placement is not random and not hand-set; each petal
 * sits at the golden angle from the last, which is how a real flower head packs.
 */
export function BloomScene({ accent }: { accent: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, -0.5)
    shape.bezierCurveTo(0.4, -0.1, 0.3, 0.45, 0, 0.62)
    shape.bezierCurveTo(-0.3, 0.45, -0.4, -0.1, 0, -0.5)
    return new THREE.ShapeGeometry(shape, 10)
  }, [])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime

    for (let i = 0; i < COUNT; i += 1) {
      const ratio = i / COUNT
      const angle = i * GOLDEN + t * 0.12
      const radius = Math.sqrt(ratio) * 2.1
      // Unfurl: outer petals lift and lie flatter than the tight centre.
      const open = 0.35 + Math.sin(t * 0.5 + ratio * 3) * 0.12
      dummy.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.cos(ratio * Math.PI) * 0.5,
      )
      dummy.rotation.set(open * ratio * 2.2, 0, angle + Math.PI / 2)
      dummy.scale.setScalar(0.1 + ratio * 0.4)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.rotation.z = t * 0.06
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, COUNT]} rotation={[-0.5, 0, 0]}>
      <meshStandardMaterial
        color={accent}
        roughness={0.7}
        side={THREE.DoubleSide}
        transparent
        opacity={0.82}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
