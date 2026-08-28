/**
 * Shared gate for the WebGL scenes. Kept in one place so the hero backdrop and
 * the project cards cannot drift apart on what counts as a capable device.
 */
export function canRender3D(): boolean {
  if (typeof window === "undefined") return false

  // Asking for less motion should mean less work, not just less movement.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false

  if (window.matchMedia("(pointer: coarse)").matches) return false
  if (window.innerWidth < 900) return false

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (typeof memory === "number" && memory < 4) return false

  return supportsWebGL()
}

/**
 * Probing for WebGL means creating a context, and a context counts against a
 * hard per-browser budget. Since this now runs on every resize, the answer is
 * cached and the probe hands its context straight back.
 */
let webglSupport: boolean | null = null

function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport

  try {
    const probe = document.createElement("canvas")
    const context = probe.getContext("webgl2") || probe.getContext("webgl")
    context?.getExtension("WEBGL_lose_context")?.loseContext()
    webglSupport = Boolean(context)
  } catch {
    webglSupport = false
  }

  return webglSupport
}
