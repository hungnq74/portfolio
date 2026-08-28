"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * Dreamify — raw data settling into something readable.
 * Technique: vertex displacement in a custom shader. The surface is a flat
 * plane; every ripple on it is computed per-vertex on the GPU.
 */
export function WaterScene({ accent }: { accent: string }) {
  const material = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(accent) } }),
    [accent],
  )

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh rotation={[-0.95, 0, 0.35]}>
      <planeGeometry args={[5, 5, 96, 96]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        vertexShader={`
          uniform float uTime;
          varying float vHeight;
          void main() {
            vec3 p = position;
            float d = length(p.xy);
            float h = sin(d * 5.0 - uTime * 1.8) * 0.16 * exp(-d * 0.55)
                    + sin(p.x * 2.2 + uTime * 0.7) * 0.05
                    + cos(p.y * 1.8 - uTime * 0.5) * 0.04;
            p.z += h;
            vHeight = h;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vHeight;
          void main() {
            float crest = clamp(vHeight * 4.5 + 0.5, 0.0, 1.0);
            vec3 shade = mix(uColor * 0.45, mix(uColor, vec3(1.0), 0.65), crest);
            gl_FragColor = vec4(shade, 0.42 + crest * 0.45);
          }
        `}
      />
    </mesh>
  )
}
