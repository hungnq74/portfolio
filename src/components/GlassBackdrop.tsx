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
  const scroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      // The hero owns the first viewport, so that is the whole travel.
      scroll.current = Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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
    const progress = scroll.current

    // The hero card scales up and fades on scroll — "like a portal", per Hero.
    // Driving the slab along the same gesture makes that literal: it grows,
    // comes forward, and passes the viewer instead of sitting in the corner.
    group.current.position.z = progress * 9
    group.current.scale.setScalar(1 + progress * 1.7)
    // Past the camera there is nothing left to draw.
    group.current.visible = progress < 0.99

    // Idle drift and pointer parallax, kept small so scroll stays in charge.
    group.current.rotation.x = Math.sin(t * 0.18) * 0.13 + pointer.current.y * 0.12
    group.current.rotation.y = Math.sin(t * 0.16) * 0.3 + pointer.current.x * 0.24
    group.current.position.x = pointer.current.x * 0.32
    group.current.position.y = Math.sin(t * 0.42) * 0.1 + progress * 0.5
  })

  return (
    <group ref={group}>
      <RoundedBox args={[4.15, 2.75, 0.6]} radius={0.44} smoothness={8} castShadow={false}>
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
