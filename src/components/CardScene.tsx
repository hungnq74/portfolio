"use client"

import { Canvas } from "@react-three/fiber"
import type { Project } from "@/lib/projects"
import { CARD_SCENES } from "./cardScenes"

/**
 * One canvas per card, but never nine at once. A live canvas holds a WebGL
 * context, and the browser caps how many exist — a cap the hero backdrop
 * already draws from. StickyStack mounts this for the card in front and its
 * immediate neighbours, so the next scene is warm before it is reached and the
 * far ones are not paying for anything.
 */
export function CardScene({
  lens,
  accent,
  visible,
}: {
  lens: Project["visual"]["lens"]
  accent: string
  visible: boolean
}) {
  const Scene = CARD_SCENES[lens]

  return (
    <Canvas
      className="pointer-events-none"
      dpr={[1, 1.5]}
      // Neighbours stay mounted so they are ready, but only the card in front
      // spends frames.
      frameloop={visible ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 4.4], fov: 45 }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <directionalLight position={[-2, -1, 2]} intensity={0.5} />
      <Scene accent={accent} />
    </Canvas>
  )
}

export default CardScene
