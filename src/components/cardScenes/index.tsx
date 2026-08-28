"use client"

import type { Project } from "@/lib/projects"
import { WaterScene } from "./water"
import { DriftScene } from "./drift"
import { RibbonScene } from "./ribbon"
import { CloudScene } from "./cloud"
import { OrbitScene } from "./orbit"
import { RingScene } from "./rings"
import { BloomScene } from "./bloom"
import { TerrainScene } from "./terrain"
import { NetworkScene } from "./network"

type Lens = Project["visual"]["lens"]

/**
 * Nine cards, nine techniques — displacement shader, deformed geometry, points,
 * line trails, instancing on a clock, phyllotaxis, wireframe heightfield, and a
 * graph rebuilt per frame. Sharing a look was never the point.
 */
export const CARD_SCENES: Record<Lens, (props: { accent: string }) => JSX.Element> = {
  drop: WaterScene,
  petal: DriftScene,
  leaf: RibbonScene,
  heart: CloudScene,
  orbit: OrbitScene,
  ripple: RingScene,
  blossom: BloomScene,
  terrain: TerrainScene,
  network: NetworkScene,
}
