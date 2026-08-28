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

  try {
    const probe = document.createElement("canvas")
    return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"))
  } catch {
    return false
  }
}
