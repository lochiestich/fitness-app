// Matches the --color-fatigue-* stops in src/styles/tokens.css.
const FATIGUE_COLD: [number, number, number] = [0x2f, 0x6f, 0x8f]
const FATIGUE_MID: [number, number, number] = [0xd8, 0xb0, 0x4a]
const FATIGUE_HOT: [number, number, number] = [0xd1, 0x50, 0x3f]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

function toHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
  )
}

export function fatigueColor(value: number): string {
  const t = Math.max(0, Math.min(1, value))
  const rgb =
    t < 0.5
      ? lerpColor(FATIGUE_COLD, FATIGUE_MID, t / 0.5)
      : lerpColor(FATIGUE_MID, FATIGUE_HOT, (t - 0.5) / 0.5)
  return toHex(rgb)
}
