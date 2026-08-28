"use client"

import { OrthographicCamera } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import type {
  ConceptArtifactKind,
  ConceptProject as ConceptFeaturedProject,
} from "../conceptProjects"

export type WorldScrollState = {
  progress: number
  active: number
  local: number
}

export type WorldPointerState = {
  x: number
  y: number
}

type SceneProps = {
  projects: readonly ConceptFeaturedProject[]
  activeIndex: number
  scroll: React.MutableRefObject<WorldScrollState>
  pointer: React.MutableRefObject<WorldPointerState>
  compact: boolean
  highQuality: boolean
  theme: "paper" | "signal"
}

type PlotColors = {
  surface: string
  ink: string
  signal: string
}

type PlotPoint = readonly [number, number, number]

type Phase = {
  local: number
  enter: number
  exit: number
  presence: number
}

const PAPER: PlotColors = {
  surface: "#EEE9DD",
  ink: "#141411",
  signal: "#EF4D2F",
}

const SIGNAL: PlotColors = {
  surface: "#0B0E0D",
  ink: "#F2F2E8",
  signal: "#C8FF45",
}

const PROJECT_COUNT = 5

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))

const smooth = (from: number, to: number, value: number) => {
  const x = clamp((value - from) / Math.max(to - from, Number.EPSILON))
  return x * x * (3 - 2 * x)
}

function phaseAt(progress: number, index: number): Phase {
  const local = clamp(progress * PROJECT_COUNT - index)
  const enter = smooth(0, 0.18, local)
  const exit = smooth(0.72, 1, local)

  return {
    local,
    enter,
    exit,
    presence: enter * (1 - exit),
  }
}

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function resamplePolyline(vertices: readonly PlotPoint[], count: number) {
  const distances = [0]
  let total = 0

  for (let index = 1; index < vertices.length; index += 1) {
    const previous = vertices[index - 1]
    const current = vertices[index]
    total += Math.hypot(
      current[0] - previous[0],
      current[1] - previous[1],
      current[2] - previous[2],
    )
    distances.push(total)
  }

  const result = new Float32Array(count * 3)
  let segment = 0

  for (let pointIndex = 0; pointIndex < count; pointIndex += 1) {
    const distance = (pointIndex / Math.max(count - 1, 1)) * total
    while (
      segment < distances.length - 2 &&
      distances[segment + 1] < distance
    ) {
      segment += 1
    }

    const start = vertices[segment]
    const end = vertices[Math.min(segment + 1, vertices.length - 1)]
    const length = Math.max(distances[segment + 1] - distances[segment], 0.0001)
    const local = clamp((distance - distances[segment]) / length)
    const offset = pointIndex * 3

    result[offset] = THREE.MathUtils.lerp(start[0], end[0], local)
    result[offset + 1] = THREE.MathUtils.lerp(start[1], end[1], local)
    result[offset + 2] = THREE.MathUtils.lerp(start[2], end[2], local)
  }

  return result
}

function compressTarget(count: number) {
  const result = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const t = index / Math.max(count - 1, 1)
    const offset = index * 3
    const focus = smooth(0.08, 0.62, t)
    const noise =
      Math.sin(t * Math.PI * 10.4 + 0.4) * 0.62 +
      Math.sin(t * Math.PI * 27.2) * 0.21

    result[offset] = -2.72 + t * 5.44
    result[offset + 1] = noise * (1 - focus)
    result[offset + 2] = Math.sin(t * Math.PI * 5) * 0.018
  }

  return result
}

function attractTarget(count: number) {
  const result = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const t = index / Math.max(count - 1, 1)
    let x: number
    let y: number

    if (t < 0.46) {
      const angle = -Math.PI / 2 + (t / 0.46) * Math.PI * 2
      x = Math.cos(angle) * 2.08
      y = Math.sin(angle) * 1.42
    } else if (t < 0.54) {
      const bridge = smooth(0.46, 0.54, t)
      x = 0
      y = THREE.MathUtils.lerp(-1.42, -0.9, bridge)
    } else {
      const angle = -Math.PI / 2 - ((t - 0.54) / 0.46) * Math.PI * 2
      x = Math.cos(angle) * 1.28
      y = Math.sin(angle) * 0.9
    }

    const offset = index * 3
    result[offset] = x
    result[offset + 1] = y
    result[offset + 2] = 0.012
  }

  return result
}

function unfoldTarget(count: number) {
  const vertices: PlotPoint[] = []
  const lanes = 6

  for (let lane = 0; lane < lanes; lane += 1) {
    const y = 1.55 - lane * 0.62
    const direction = lane % 2 === 0 ? 1 : -1
    const leftX = -2.58 + (lane % 3) * 0.14
    const leftY = y + (lane % 2 === 0 ? 0.18 : -0.16)
    const row: PlotPoint[] = [
      [leftX, leftY, 0],
      [-1.82, y + (lane % 3 - 1) * 0.19, 0.018],
      [-1.06, y + (lane % 2 === 0 ? -0.13 : 0.11), 0.01],
      [-0.35, y, 0],
      [2.56, y, 0],
    ]

    if (direction < 0) row.reverse()
    vertices.push(...row)

    if (lane < lanes - 1) {
      const nextY = 1.55 - (lane + 1) * 0.62
      const edgeX = direction > 0 ? 2.56 : -2.58 + ((lane + 1) % 3) * 0.14
      vertices.push([edgeX, nextY, 0])
    }
  }

  return resamplePolyline(vertices, count)
}

function routeTarget(count: number) {
  return resamplePolyline(
    [
      [-2.72, -1.14, 0],
      [-2.18, 0.82, 0.015],
      [-1.54, -0.48, 0.02],
      [-0.82, 0.24, 0.012],
      [-0.24, 0, 0],
      [0.24, 0, 0],
      [1.32, 0, 0],
      [2.72, 0, 0],
    ],
    count,
  )
}

function loopTarget(count: number) {
  const result = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const t = index / Math.max(count - 1, 1)
    const angle = -Math.PI / 2 + t * Math.PI * 2
    const offset = index * 3
    result[offset] = Math.cos(angle) * 1.78
    result[offset + 1] = Math.sin(angle) * 1.78
    result[offset + 2] = 0.012
  }

  return result
}

function targetFor(kind: ConceptArtifactKind, count: number) {
  switch (kind) {
    case "compress":
      return compressTarget(count)
    case "attract":
      return attractTarget(count)
    case "unfold":
      return unfoldTarget(count)
    case "route":
      return routeTarget(count)
    case "loop":
      return loopTarget(count)
  }
}

function flattenPoints(points: readonly PlotPoint[]) {
  return new Float32Array(points.flatMap((point) => [...point]))
}

function PlotLine({
  points,
  color,
  opacity = 1,
}: {
  points: readonly PlotPoint[]
  color: string
  opacity?: number
}) {
  const positions = useMemo(() => flattenPoints(points), [points])
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent: true,
    })
    material.userData.plotOpacity = opacity
    const object = new THREE.Line(geometry, material)
    object.frustumCulled = false
    return object
  }, [color, opacity, positions])

  useEffect(
    () => () => {
      line.geometry.dispose()
      line.material.dispose()
    },
    [line],
  )

  return <primitive object={line} />
}

function PlotSegments({
  points,
  color,
  opacity = 1,
}: {
  points: readonly PlotPoint[]
  color: string
  opacity?: number
}) {
  const positions = useMemo(() => flattenPoints(points), [points])
  const lineSegments = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent: true,
    })
    material.userData.plotOpacity = opacity
    const object = new THREE.LineSegments(geometry, material)
    object.frustumCulled = false
    return object
  }, [color, opacity, positions])

  useEffect(
    () => () => {
      lineSegments.geometry.dispose()
      lineSegments.material.dispose()
    },
    [lineSegments],
  )

  return <primitive object={lineSegments} />
}

function ellipsePoints(
  radiusX: number,
  radiusY: number,
  centerX = 0,
  centerY = 0,
  segments = 64,
) {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2
    return [
      centerX + Math.cos(angle) * radiusX,
      centerY + Math.sin(angle) * radiusY,
      0.035,
    ] as const
  })
}

function dashedEllipseSegments(
  radiusX: number,
  radiusY: number,
  dashCount: number,
) {
  const points: PlotPoint[] = []
  for (let dash = 0; dash < dashCount; dash += 1) {
    const start = (dash / dashCount) * Math.PI * 2
    const end = start + (Math.PI * 2 * 0.56) / dashCount
    points.push(
      [Math.cos(start) * radiusX, Math.sin(start) * radiusY, 0.03],
      [Math.cos(end) * radiusX, Math.sin(end) * radiusY, 0.03],
    )
  }
  return points
}

function registrationSegments(width = 2.64, height = 2.04) {
  const tick = 0.18
  return [
    [-width, -height, 0],
    [-width + tick, -height, 0],
    [-width, -height, 0],
    [-width, -height + tick, 0],
    [width, -height, 0],
    [width - tick, -height, 0],
    [width, -height, 0],
    [width, -height + tick, 0],
    [-width, height, 0],
    [-width + tick, height, 0],
    [-width, height, 0],
    [-width, height - tick, 0],
    [width, height, 0],
    [width - tick, height, 0],
    [width, height, 0],
    [width, height - tick, 0],
  ] as const satisfies readonly PlotPoint[]
}

function CompressMarks({ colors }: { colors: PlotColors }) {
  const points = useMemo(() => {
    const random = seededRandom(9147)
    return Array.from({ length: 24 }, (_, index) => ({
      x: -2.42 + random() * 1.82,
      y: (random() - 0.5) * 2.72,
      size: index % 5 === 0 ? 0.048 : 0.027,
    }))
  }, [])

  return (
    <>
      <PlotLine points={ellipsePoints(0.18, 1.2, -0.38)} color={colors.ink} opacity={0.58} />
      <PlotLine points={ellipsePoints(0.12, 0.78, 0.08)} color={colors.signal} opacity={0.92} />
      {points.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, 0.055]}>
          <circleGeometry args={[point.size, 10]} />
          <meshBasicMaterial
            color={index % 6 === 0 ? colors.signal : colors.ink}
            opacity={index % 6 === 0 ? 0.95 : 0.54}
            transparent
            userData={{ plotOpacity: index % 6 === 0 ? 0.95 : 0.54 }}
          />
        </mesh>
      ))}
      <PlotSegments
        points={[
          [0.28, -0.11, 0.04],
          [2.67, -0.11, 0.04],
          [0.28, 0.11, 0.04],
          [2.67, 0.11, 0.04],
        ]}
        color={colors.ink}
        opacity={0.2}
      />
    </>
  )
}

function AttractMarks({ colors }: { colors: PlotColors }) {
  const nodes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const outer = index % 2 === 0
        const angle = (index / 18) * Math.PI * 2 + (outer ? 0.08 : -0.12)
        return {
          x: Math.cos(angle) * (outer ? 2.08 : 1.28),
          y: Math.sin(angle) * (outer ? 1.42 : 0.9),
        }
      }),
    [],
  )

  return (
    <>
      <PlotSegments points={dashedEllipseSegments(2.08, 1.42, 32)} color={colors.ink} opacity={0.42} />
      <PlotSegments points={dashedEllipseSegments(1.28, 0.9, 24)} color={colors.signal} opacity={0.72} />
      <mesh position={[0, 0, 0.07]}>
        <circleGeometry args={[0.17, 28]} />
        <meshBasicMaterial
          color={colors.signal}
          transparent
          userData={{ plotOpacity: 1 }}
        />
      </mesh>
      {nodes.map((node, index) => (
        <mesh key={index} position={[node.x, node.y, 0.06]}>
          <ringGeometry args={[0.035, index % 4 === 0 ? 0.078 : 0.058, 16]} />
          <meshBasicMaterial
            color={index % 5 === 0 ? colors.signal : colors.ink}
            opacity={index % 5 === 0 ? 0.9 : 0.58}
            transparent
            userData={{ plotOpacity: index % 5 === 0 ? 0.9 : 0.58 }}
          />
        </mesh>
      ))}
    </>
  )
}

function UnfoldMarks({ colors }: { colors: PlotColors }) {
  return (
    <>
      {Array.from({ length: 6 }, (_, lane) => {
        const y = 1.55 - lane * 0.62
        return (
          <PlotLine
            key={lane}
            points={[
              [-0.3, y, 0.025],
              [2.62, y, 0.025],
            ]}
            color={lane === 0 ? colors.signal : colors.ink}
            opacity={lane === 0 ? 0.7 : 0.24}
          />
        )
      })}
      <PlotSegments
        points={Array.from({ length: 6 }, (_, lane) => {
          const y = 1.55 - lane * 0.62
          return [
            [-2.66, y - 0.11, 0.03],
            [-2.66, y + 0.11, 0.03],
          ] as const
        }).flat()}
        color={colors.signal}
        opacity={0.82}
      />
      {Array.from({ length: 6 }, (_, lane) => (
        <mesh key={lane} position={[2.62, 1.55 - lane * 0.62, 0.045]}>
          <circleGeometry args={[lane === 0 ? 0.047 : 0.031, 12]} />
          <meshBasicMaterial
            color={lane === 0 ? colors.signal : colors.ink}
            opacity={lane === 0 ? 0.9 : 0.46}
            transparent
            userData={{ plotOpacity: lane === 0 ? 0.9 : 0.46 }}
          />
        </mesh>
      ))}
    </>
  )
}

function RouteMarks({ colors }: { colors: PlotColors }) {
  const routes = useMemo(
    () =>
      Array.from({ length: 7 }, (_, routeIndex) => {
        const laneY = (routeIndex - 3) * 0.42
        const wobble = routeIndex % 2 === 0 ? 0.22 : -0.2
        return [
          [-2.62, laneY + wobble, 0.025],
          [-1.72, laneY - wobble, 0.025],
          [-0.72, laneY * 0.46, 0.025],
          [-0.18, laneY * 0.33, 0.025],
          [0.18, laneY * 0.33, 0.025],
          [1.18, laneY * 0.33, 0.025],
          [2.62, laneY * 0.33, 0.025],
        ] as const satisfies readonly PlotPoint[]
      }),
    [],
  )

  return (
    <>
      {routes.map((route, routeIndex) => (
        <PlotLine
          key={routeIndex}
          points={route}
          color={routeIndex === 3 ? colors.signal : colors.ink}
          opacity={routeIndex === 3 ? 0.9 : 0.38}
        />
      ))}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[0.1, 3.18]} />
        <meshBasicMaterial
          color={colors.signal}
          opacity={0.82}
          transparent
          userData={{ plotOpacity: 0.82 }}
        />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[2.63, (index - 3) * 0.138, 0.055]}>
          <circleGeometry args={[index === 3 ? 0.052 : 0.029, 12]} />
          <meshBasicMaterial
            color={index === 3 ? colors.signal : colors.ink}
            opacity={index === 3 ? 0.95 : 0.5}
            transparent
            userData={{ plotOpacity: index === 3 ? 0.95 : 0.5 }}
          />
        </mesh>
      ))}
    </>
  )
}

function LoopMarks({ colors }: { colors: PlotColors }) {
  const sockets = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const angle = -Math.PI / 2 + (index / 5) * Math.PI * 2
        return [Math.cos(angle) * 1.78, Math.sin(angle) * 1.78, 0.055] as const
      }),
    [],
  )

  return (
    <>
      <PlotSegments
        points={dashedEllipseSegments(1.78, 1.78, 28)}
        color={colors.ink}
        opacity={0.5}
      />
      {sockets.map((position, index) => (
        <mesh
          key={index}
          position={position}
          userData={{ socketIndex: index }}
        >
          <ringGeometry args={[0.095, 0.17, 24]} />
          <meshBasicMaterial
            color={colors.signal}
            transparent
            userData={{ plotOpacity: 1 }}
          />
        </mesh>
      ))}
    </>
  )
}

function AuxiliaryMarks({
  kind,
  index,
  scroll,
  colors,
}: {
  kind: ConceptArtifactKind
  index: number
  scroll: React.MutableRefObject<WorldScrollState>
  colors: PlotColors
}) {
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    const target = group.current
    if (!target) return
    const phase = phaseAt(scroll.current.progress, index)
    const presence = phase.presence
    target.visible = presence > 0.001
    if (!target.visible) return

    const scale = 0.9 + phase.enter * 0.1
    target.scale.set(scale, scale, 1)

    target.traverse((object) => {
      if (!("material" in object)) return
      const objectWithMaterial = object as THREE.Object3D & {
        material: THREE.Material | THREE.Material[]
      }
      const materials = Array.isArray(objectWithMaterial.material)
        ? objectWithMaterial.material
        : [objectWithMaterial.material]
      const socketIndex = object.userData.socketIndex
      const activation =
        typeof socketIndex === "number"
          ? smooth(socketIndex / 6, (socketIndex + 1.3) / 6, phase.enter)
          : 1

      if (typeof socketIndex === "number") {
        object.scale.setScalar(0.58 + activation * 0.42)
      }

      for (const material of materials) {
        const baseOpacity = material.userData.plotOpacity
        if (typeof baseOpacity === "number") {
          material.opacity = baseOpacity * presence * activation
        }
      }
    })
  })

  return (
    <group ref={group}>
      <PlotSegments points={registrationSegments()} color={colors.ink} opacity={0.35} />
      {kind === "compress" ? <CompressMarks colors={colors} /> : null}
      {kind === "attract" ? <AttractMarks colors={colors} /> : null}
      {kind === "unfold" ? <UnfoldMarks colors={colors} /> : null}
      {kind === "route" ? <RouteMarks colors={colors} /> : null}
      {kind === "loop" ? <LoopMarks colors={colors} /> : null}
    </group>
  )
}

function ProofFilament({
  projects,
  scroll,
  pointer,
  compact,
  color,
}: {
  projects: readonly ConceptFeaturedProject[]
  scroll: React.MutableRefObject<WorldScrollState>
  pointer: React.MutableRefObject<WorldPointerState>
  compact: boolean
  color: string
}) {
  const pointCount = compact ? 72 : 128
  const positions = useMemo(() => new Float32Array(pointCount * 3), [pointCount])
  const offsets = useMemo(() => new Float32Array(pointCount * 2), [pointCount])
  const velocities = useMemo(() => new Float32Array(pointCount * 2), [pointCount])
  const pointerSpring = useRef({ x: 0, y: 0, vx: 0, vy: 0 })
  const targets = useMemo(
    () => projects.map((project) => targetFor(project.artifact.kind, pointCount)),
    [pointCount, projects],
  )
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const material = new THREE.LineBasicMaterial({
      color,
      opacity: 0.98,
      transparent: true,
    })
    const object = new THREE.Line(geometry, material)
    object.frustumCulled = false
    return object
  }, [color, positions])

  useEffect(
    () => () => {
      line.geometry.dispose()
      line.material.dispose()
    },
    [line],
  )

  useFrame((state, rawDelta) => {
    if (targets.length === 0) return

    const delta = Math.min(rawDelta, 1 / 20)
    const currentIndex = Math.min(
      targets.length - 1,
      Math.max(0, scroll.current.active),
    )
    const nextIndex = Math.min(targets.length - 1, currentIndex + 1)
    const morph = smooth(0.72, 1, scroll.current.local)
    const current = targets[currentIndex]
    const next = targets[nextIndex]
    const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 0])
    const groupX = compact ? 0 : 2.82
    const groupY = compact ? 1.34 : -0.04
    const groupScale = compact ? 0.72 : 1
    const pointerTargetX =
      (pointer.current.x * viewport.width * 0.5 - groupX) / groupScale
    const pointerTargetY =
      (pointer.current.y * viewport.height * 0.5 - groupY) / groupScale
    const pointerIsActive =
      Math.abs(pointer.current.x) + Math.abs(pointer.current.y) > 0.001
    const spring = pointerSpring.current
    const pointerStiffness = 72
    const pointerDamping = Math.exp(-13 * delta)

    spring.vx =
      (spring.vx + (pointerTargetX - spring.x) * pointerStiffness * delta) *
      pointerDamping
    spring.vy =
      (spring.vy + (pointerTargetY - spring.y) * pointerStiffness * delta) *
      pointerDamping
    spring.x += spring.vx * delta
    spring.y += spring.vy * delta

    for (let index = 0; index < pointCount; index += 1) {
      const pointOffset = index * 3
      const springOffset = index * 2
      const baseX = THREE.MathUtils.lerp(
        current[pointOffset],
        next[pointOffset],
        morph,
      )
      const baseY = THREE.MathUtils.lerp(
        current[pointOffset + 1],
        next[pointOffset + 1],
        morph,
      )
      const baseZ = THREE.MathUtils.lerp(
        current[pointOffset + 2],
        next[pointOffset + 2],
        morph,
      )
      const dx = spring.x - baseX
      const dy = spring.y - baseY
      const distanceSquared = dx * dx + dy * dy
      const influence = Math.exp(-distanceSquared * 2.2)
      const desiredX = pointerIsActive ? dx * influence * 0.13 : 0
      const desiredY = pointerIsActive ? dy * influence * 0.18 : 0
      const offsetStiffness = 92
      const offsetDamping = Math.exp(-16 * delta)

      velocities[springOffset] =
        (velocities[springOffset] +
          (desiredX - offsets[springOffset]) * offsetStiffness * delta) *
        offsetDamping
      velocities[springOffset + 1] =
        (velocities[springOffset + 1] +
          (desiredY - offsets[springOffset + 1]) * offsetStiffness * delta) *
        offsetDamping
      offsets[springOffset] += velocities[springOffset] * delta
      offsets[springOffset + 1] += velocities[springOffset + 1] * delta

      positions[pointOffset] = baseX + offsets[springOffset]
      positions[pointOffset + 1] = baseY + offsets[springOffset + 1]
      positions[pointOffset + 2] = baseZ + 0.08
    }

    const attribute = line.geometry.getAttribute("position")
    if (attribute) attribute.needsUpdate = true
  })

  return <primitive object={line} />
}

function PaperRelief({
  colors,
  highQuality,
}: {
  colors: PlotColors
  highQuality: boolean
}) {
  return (
    <>
      <mesh position={[0, 0, -0.16]}>
        <planeGeometry args={[5.72, 4.48]} />
        <meshBasicMaterial
          color={colors.surface}
          opacity={highQuality ? 0.34 : 0.22}
          transparent
        />
      </mesh>
      <mesh position={[0.05, -0.05, -0.12]}>
        <planeGeometry args={[5.46, 4.2]} />
        <meshBasicMaterial color={colors.ink} opacity={0.025} transparent />
      </mesh>
    </>
  )
}

export function WorkScene({
  projects,
  activeIndex,
  scroll,
  pointer,
  compact,
  highQuality,
  theme,
}: SceneProps) {
  const colors = theme === "signal" ? SIGNAL : PAPER
  const safeActiveIndex = Math.min(
    Math.max(activeIndex, 0),
    Math.max(projects.length - 1, 0),
  )
  const activeProject = projects[safeActiveIndex]

  if (!activeProject) return null

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={compact ? 70 : 104}
        near={0.1}
        far={30}
      />

      <group position={[compact ? 0 : 2.82, compact ? 1.34 : -0.04, 0]} scale={compact ? 0.72 : 1}>
        <PaperRelief colors={colors} highQuality={highQuality} />
        <ProofFilament
          projects={projects}
          scroll={scroll}
          pointer={pointer}
          compact={compact}
          color={colors.signal}
        />
        <AuxiliaryMarks
          key={`${activeProject.slug}-${theme}`}
          kind={activeProject.artifact.kind}
          index={safeActiveIndex}
          scroll={scroll}
          colors={colors}
        />
      </group>
    </>
  )
}
