"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { MeshTransmissionMaterial, RoundedBox, useVideoTexture } from "@react-three/drei"
import { Suspense, useEffect, useRef } from "react"
import * as THREE from "three"

const VIDEO_SRC = "/assets/hero/landscape-bg.mp4"
const BACKDROP_Z = -6

/**
 * The landscape, moved into the 3D scene so the glass has something real to
 * bend. Scaled to cover the frustum the way `object-fit: cover` would.
 */
function Backdrop() {
  const texture = useVideoTexture(VIDEO_SRC, { muted: true, loop: true, start: true })
  const { viewport, camera } = useThree()
  const mesh = useRef<THREE.Mesh>(null)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
  }, [texture])

  useFrame(() => {
    if (!mesh.current) return
    const v = viewport.getCurrentViewport(camera, [0, 0, BACKDROP_Z])
    const img = texture.image as HTMLVideoElement | undefined
    const videoAspect = img?.videoWidth ? img.videoWidth / img.videoHeight : 16 / 9
    const viewAspect = v.width / v.height
    // cover: match the axis that would otherwise letterbox
    const scale =
      viewAspect > videoAspect
        ? { x: v.width, y: v.width / videoAspect }
        : { x: v.height * videoAspect, y: v.height }
    mesh.current.scale.set(scale.x, scale.y, 1)
  })

  return (
    <mesh ref={mesh} position={[0, 0, BACKDROP_Z]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

/**
 * A real glass slab echoing the rounded rectangle of the DOM hero card —
 * same shape language, but actually refracting what sits behind it.
 */
function GlassSlab({ quality }: { quality: "high" | "low" }) {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    // slow drift, with the pointer nudging it rather than driving it
    group.current.rotation.x = Math.sin(t * 0.18) * 0.22 + pointer.current.y * 0.16
    group.current.rotation.y = Math.sin(t * 0.16) * 0.5 + pointer.current.x * 0.3
    group.current.position.y = -1.35 + Math.sin(t * 0.42) * 0.14
    group.current.position.x = 1.62 + pointer.current.x * 0.22
  })

  return (
    <group ref={group}>
      <RoundedBox args={[2.25, 2.25, 0.72]} radius={0.34} smoothness={8} castShadow={false}>
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.9}
          roughness={0.06}
          ior={1.42}
          chromaticAberration={0.28}
          anisotropy={0.2}
          distortion={0.24}
          distortionScale={0.45}
          temporalDistortion={0.08}
          samples={quality === "high" ? 6 : 3}
          resolution={quality === "high" ? 512 : 256}
          backside={quality === "high"}
          attenuationDistance={4}
          attenuationColor="#e8f2ff"
          color="#ffffff"
        />
      </RoundedBox>
    </group>
  )
}

export function GlassBackdrop({
  quality,
  onFailure,
}: {
  quality: "high" | "low"
  onFailure: () => void
}) {
  return (
    <Canvas
      className="pointer-events-none"
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: quality === "high", powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      onCreated={({ gl }) => {
        // Losing the context should hand the page back to the plain video
        // rather than leave an empty layer behind.
        gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true })
      }}
    >
      <color attach="background" args={["#0b0e0d"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <Suspense fallback={null}>
        <Backdrop />
        <GlassSlab quality={quality} />
      </Suspense>
    </Canvas>
  )
}

export default GlassBackdrop
