import { useEffect, useRef } from "react"

/**
 * FlockBackground — morphing tech-icon particle formation
 * -----------------------------------------------------------
 * A flat field of particles that periodically reforms into a different
 * tech/AI/security/space-themed silhouette: curly braces, a terminal
 * prompt, a padlock, a satellite, a rocket, a robot face, a globe/orbit,
 * and a chip.
 *
 * Each transition has "life" to it: the incoming shape flies in from an
 * off-screen direction specific to that icon (a satellite banks in
 * diagonally, a rocket launches up from below, a robot walks in from the
 * side, a globe spins into place, etc.), tilted and slightly scaled
 * down, then eases — staggered per-particle so it cascades rather than
 * snapping — into its resting silhouette. A faint continuous idle
 * shimmer keeps it from ever looking frozen between morphs.
 */

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  size: number
  hue: number
  sat: number
  light: number
  twinkleSpeed: number
  twinklePhase: number
  delay: number // per-particle stagger so arrivals cascade, not snap
}

const FLEE_RADIUS = 140
const FLEE_FORCE = 15

interface Point {
  x: number
  y: number
}

interface ShapeMeta {
  entryDir: Point   // unit-ish direction particles fly in FROM
  tiltDeg: number    // rotation applied during flight, eases to 0
  scaleStart: number // formation scale at the very start of flight
}

const COUNT = 900
const SPRING = 0.06
const DAMPING = 0.88
const SHAPE_HOLD_MS = 5500     // how long a shape rests before morphing
const TRANSITION_MS = 900      // base per-particle flight duration
const STAGGER_MS = 450         // extra random delay spread per particle

// Blue palette, with a brighter accent for sparkle
const PALETTES = [
  { h: 217, s: 85, l: 60 },
  { h: 217, s: 80, l: 55 },
  { h: 217, s: 90, l: 65 },
  { h: 210, s: 80, l: 58 },
  { h: 220, s: 85, l: 62 },
  { h: 217, s: 75, l: 50 },
  { h: 217, s: 85, l: 70 },
  { h: 205, s: 80, l: 75 }, // bright sparkle accent
]

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// --- shape drawers — each paints a solid silhouette onto a white SWxSH buffer ---

function drawBraces(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  ctx.fillStyle = "#000"
  ctx.font = `900 ${SH * 0.8}px "Courier New", Courier, monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("{ }", SW / 2, SH / 2)
}

function drawTerminal(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  ctx.fillStyle = "#000"
  ctx.font = `900 ${SH * 0.72}px "Courier New", Courier, monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(">_", SW / 2, SH / 2)
}

function drawLock(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  const cx = SW / 2
  const cy = SH / 2
  const bodyW = SH * 0.5
  const bodyH = SH * 0.42
  const top = cy - bodyH * 0.1

  ctx.strokeStyle = "#000"
  ctx.lineCap = "round"
  ctx.lineWidth = SH * 0.075
  ctx.beginPath()
  ctx.arc(cx, top - bodyH * 0.05, SH * 0.2, Math.PI, 0, false)
  ctx.stroke()

  ctx.fillStyle = "#000"
  roundRect(ctx, cx - bodyW / 2, top, bodyW, bodyH, SH * 0.06)
  ctx.fill()

  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.arc(cx, top + bodyH * 0.45, SH * 0.045, 0, Math.PI * 2)
  ctx.fill()
}

function drawSatellite(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  const cx = SW / 2
  const cy = SH / 2
  ctx.fillStyle = "#000"

  const bw = SH * 0.22
  const bh = SH * 0.22
  ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh)

  const pw = SH * 0.5
  const ph = SH * 0.18
  ctx.fillRect(cx - bw / 2 - pw - 14, cy - ph / 2, pw, ph)
  ctx.fillRect(cx + bw / 2 + 14, cy - ph / 2, pw, ph)

  ctx.fillStyle = "#fff"
  for (let i = 1; i < 4; i++) {
    const lx = cx - bw / 2 - pw + (pw / 4) * i - 2
    ctx.fillRect(lx, cy - ph / 2, 4, ph)
    const rx = cx + bw / 2 + 14 + (pw / 4) * i - 2
    ctx.fillRect(rx, cy - ph / 2, 4, ph)
  }

  ctx.strokeStyle = "#000"
  ctx.lineWidth = SH * 0.025
  ctx.beginPath()
  ctx.moveTo(cx, cy - bh / 2)
  ctx.lineTo(cx, cy - bh / 2 - SH * 0.18)
  ctx.stroke()
  ctx.fillStyle = "#000"
  ctx.beginPath()
  ctx.arc(cx, cy - bh / 2 - SH * 0.2, SH * 0.03, 0, Math.PI * 2)
  ctx.fill()
}

function drawRocket(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  const cx = SW / 2
  const cy = SH / 2
  const bodyW = SH * 0.22
  const bodyH = SH * 0.5

  ctx.fillStyle = "#000"
  ctx.beginPath()
  ctx.moveTo(cx, cy - bodyH / 2 - SH * 0.16)
  ctx.lineTo(cx + bodyW / 2, cy - bodyH / 2 + SH * 0.05)
  ctx.lineTo(cx + bodyW / 2, cy + bodyH / 2)
  ctx.lineTo(cx - bodyW / 2, cy + bodyH / 2)
  ctx.lineTo(cx - bodyW / 2, cy - bodyH / 2 + SH * 0.05)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(cx - bodyW / 2, cy + bodyH / 2 - SH * 0.06)
  ctx.lineTo(cx - bodyW / 2 - SH * 0.16, cy + bodyH / 2 + SH * 0.13)
  ctx.lineTo(cx - bodyW / 2, cy + bodyH / 2)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(cx + bodyW / 2, cy + bodyH / 2 - SH * 0.06)
  ctx.lineTo(cx + bodyW / 2 + SH * 0.16, cy + bodyH / 2 + SH * 0.13)
  ctx.lineTo(cx + bodyW / 2, cy + bodyH / 2)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.arc(cx, cy - SH * 0.04, SH * 0.075, 0, Math.PI * 2)
  ctx.fill()
}

function drawRobot(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  const cx = SW / 2
  const cy = SH / 2
  const headW = SH * 0.56
  const headH = SH * 0.48

  ctx.fillStyle = "#000"
  roundRect(ctx, cx - headW / 2, cy - headH / 2, headW, headH, SH * 0.08)
  ctx.fill()

  ctx.strokeStyle = "#000"
  ctx.lineWidth = SH * 0.025
  ctx.beginPath()
  ctx.moveTo(cx, cy - headH / 2)
  ctx.lineTo(cx, cy - headH / 2 - SH * 0.12)
  ctx.stroke()
  ctx.fillStyle = "#000"
  ctx.beginPath()
  ctx.arc(cx, cy - headH / 2 - SH * 0.15, SH * 0.03, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.arc(cx - headW * 0.2, cy - headH * 0.05, SH * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + headW * 0.2, cy - headH * 0.05, SH * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(cx - headW * 0.18, cy + headH * 0.16, headW * 0.36, SH * 0.04)
}

function drawGlobe(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  const cx = SW / 2
  const cy = SH / 2
  const r = SH * 0.36

  ctx.strokeStyle = "#000"
  ctx.lineWidth = SH * 0.028
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(cx, cy, r * 0.42, r, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.35)
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.35, r * 0.4, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = "#000"
  ctx.beginPath()
  ctx.arc(cx + r * 1.32, cy, SH * 0.035, 0, Math.PI * 2)
  ctx.fill()
}

function drawChip(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  const cx = SW / 2
  const cy = SH / 2
  const s = SH * 0.4

  ctx.fillStyle = "#000"
  roundRect(ctx, cx - s / 2, cy - s / 2, s, s, SH * 0.04)
  ctx.fill()

  ctx.fillStyle = "#fff"
  ctx.font = `700 ${s * 0.4}px "Courier New", Courier, monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("AI", cx, cy + s * 0.02)

  ctx.strokeStyle = "#000"
  ctx.lineWidth = SH * 0.028
  const pinLen = SH * 0.12
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(cx + i * s * 0.25, cy - s / 2)
    ctx.lineTo(cx + i * s * 0.25, cy - s / 2 - pinLen)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + i * s * 0.25, cy + s / 2)
    ctx.lineTo(cx + i * s * 0.25, cy + s / 2 + pinLen)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - s / 2, cy + i * s * 0.25)
    ctx.lineTo(cx - s / 2 - pinLen, cy + i * s * 0.25)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + s / 2, cy + i * s * 0.25)
    ctx.lineTo(cx + s / 2 + pinLen, cy + i * s * 0.25)
    ctx.stroke()
  }
}

const SHAPES: ((ctx: CanvasRenderingContext2D, SW: number, SH: number) => void)[] = [
  drawBraces,
  drawTerminal,
  drawLock,
  drawSatellite,
  drawRocket,
  drawRobot,
  drawGlobe,
  drawChip,
]

// Per-shape "personality" for how it flies into formation
const SHAPE_META: ShapeMeta[] = [
  { entryDir: { x: 0, y: 0 }, tiltDeg: 0, scaleStart: 0.4 },       // braces — zooms in from center
  { entryDir: { x: -1, y: 0 }, tiltDeg: 0, scaleStart: 1 },        // terminal — slides in from the left
  { entryDir: { x: 0, y: -1 }, tiltDeg: 22, scaleStart: 0.8 },     // lock — drops in with a turn
  { entryDir: { x: 0.9, y: -0.6 }, tiltDeg: -20, scaleStart: 1 },  // satellite — banks in from top-right
  { entryDir: { x: 0, y: 1 }, tiltDeg: 14, scaleStart: 1 },        // rocket — launches up from below
  { entryDir: { x: -1, y: 0.25 }, tiltDeg: 8, scaleStart: 0.9 },   // robot — walks in from the left
  { entryDir: { x: 0, y: 0 }, tiltDeg: 220, scaleStart: 0.55 },    // globe — spins into place
  { entryDir: { x: 0.9, y: 0.9 }, tiltDeg: -14, scaleStart: 0.85 }, // chip — slides in from bottom-right
]

function generateShapePoints(
  draw: (ctx: CanvasRenderingContext2D, SW: number, SH: number) => void,
  count: number,
  w: number,
  h: number,
  rightHalf: boolean
): Point[] {
  const SW = 600
  const SH = 320
  const offscreen = document.createElement("canvas")
  offscreen.width = SW
  offscreen.height = SH
  const octx = offscreen.getContext("2d")!

  octx.fillStyle = "#fff"
  octx.fillRect(0, 0, SW, SH)
  draw(octx, SW, SH)

  const imageData = octx.getImageData(0, 0, SW, SH)
  const pixels = imageData.data
  const candidates: Point[] = []

  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      const i = (y * SW + x) * 4
      if (pixels[i] < 128) {
        candidates.push({ x, y })
      }
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const effectiveW = rightHalf ? w / 2 : w
  const scale = (effectiveW * 1.0) / SW
  const shapeW = SW * scale
  const shapeH = SH * scale
  const ox = rightHalf ? w - shapeW : (w - shapeW) / 2
  const oy = (h - shapeH) / 2

  const result: Point[] = []
  const denom = Math.max(candidates.length, 1)
  for (let i = 0; i < count; i++) {
    const c = candidates[i % denom]
    result.push({ x: ox + c.x * scale, y: oy + c.y * scale })
  }

  return result
}

export default function FlockBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const c = ctx

    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: Particle[] = []
    let basePoints: Point[] = []
    let animId = 0
    let frame = 0
    let shapeIndex = 0
    let transitionStart = performance.now()

    // Computes where a particle should be, given how far through its
    // (staggered) flight it is. remaining=1 -> fully at the entry pose,
    // remaining=0 -> settled at its final silhouette position.
    function transformPoint(final: Point, meta: ShapeMeta, remaining: number, eased: number): Point {
      const travel = Math.max(w, h) * 0.55
      const angle = (meta.tiltDeg * Math.PI) / 180 * remaining
      const dx0 = final.x - w / 2
      const dy0 = final.y - h / 2
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const rx = dx0 * cosA - dy0 * sinA
      const ry = dx0 * sinA + dy0 * cosA
      const scale = meta.scaleStart + (1 - meta.scaleStart) * eased
      const offX = meta.entryDir.x * travel * remaining
      const offY = meta.entryDir.y * travel * remaining
      return { x: w / 2 + rx * scale + offX, y: h / 2 + ry * scale + offY }
    }

    let rightHalf = window.innerWidth >= 768

    function applyShape(index: number, isSwitch: boolean) {
      if (w === 0 || h === 0) return
      basePoints = generateShapePoints(SHAPES[index], COUNT, w, h, rightHalf)
      const meta = SHAPE_META[index]

      if (particles.length === 0) {
        particles = basePoints.map((pt, i) => {
          const p = PALETTES[i % PALETTES.length]
          const start = transformPoint(pt, meta, 1, 0)
          return {
            x: start.x,
            y: start.y,
            targetX: start.x,
            targetY: start.y,
            vx: 0,
            vy: 0,
            size: rand(2.5, 5.0),
            hue: p.h + rand(-6, 6),
            sat: p.s + rand(-6, 6),
            light: p.l + rand(-8, 8),
            twinkleSpeed: rand(0.015, 0.045),
            twinklePhase: rand(0, Math.PI * 2),
            delay: rand(0, STAGGER_MS),
          }
        })
        transitionStart = performance.now()
      } else if (isSwitch) {
        for (const p of particles) p.delay = rand(0, STAGGER_MS)
        transitionStart = performance.now()
      }
      // on resize (not a switch), basePoints just updates the endpoint —
      // the in-progress or already-settled transform naturally follows
    }

    function resize() {
      rightHalf = window.innerWidth >= 768
      const parent = canvas!.parentElement!
      const rect = parent.getBoundingClientRect()
      w = rect.width
      h = rect.height
      if (w === 0 || h === 0) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      applyShape(shapeIndex, false)
    }

    resize()

    const onMove = (e: MouseEvent | TouchEvent) => {
      let px: number, py: number
      if ("touches" in e) {
        const t = e.touches[0] || e.changedTouches[0]
        if (!t) return
        px = t.clientX
        py = t.clientY
      } else {
        px = e.clientX
        py = e.clientY
      }
      cursorRef.current = { x: px, y: py }
    }

    const onLeave = () => {
      cursorRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", onLeave)

    const morphInterval = window.setInterval(() => {
      shapeIndex = (shapeIndex + 1) % SHAPES.length
      applyShape(shapeIndex, true)
    }, SHAPE_HOLD_MS)

    function tick() {
      animId = requestAnimationFrame(tick)
      frame++
      const now = performance.now()
      const elapsed = now - transitionStart
      const meta = SHAPE_META[shapeIndex]
      const { x: cx, y: cy } = cursorRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const final = basePoints[i]
        if (final) {
          const localElapsed = elapsed - p.delay
          const t = Math.max(0, Math.min(1, localElapsed / TRANSITION_MS))
          const eased = easeOutCubic(t)
          const remaining = 1 - eased
          const target = transformPoint(final, meta, remaining, eased)
          // tiny idle shimmer once settled, so it never looks frozen
          const idle = remaining < 0.02 ? Math.sin(now * 0.0014 + i * 0.21) * 1.5 : 0
          p.targetX = target.x
          p.targetY = target.y + idle
        }

        const dx = p.targetX - p.x
        const dy = p.targetY - p.y
        p.vx += dx * SPRING
        p.vy += dy * SPRING

        const dxc = p.x - cx
        const dyc = p.y - cy
        const dc = Math.sqrt(dxc * dxc + dyc * dyc)
        if (dc < FLEE_RADIUS && dc > 0.1) {
          const strength = (1 - dc / FLEE_RADIUS) * FLEE_FORCE
          p.vx += (dxc / dc) * strength
          p.vy += (dyc / dc) * strength
        }

        p.vx *= DAMPING
        p.vy *= DAMPING
        p.x += p.vx
        p.y += p.vy
      }

      c.clearRect(0, 0, w, h)

      for (const p of particles) {
        const twinkle = 0.6 + 0.4 * Math.sin(p.twinklePhase + frame * p.twinkleSpeed)
        const alpha = 0.55 + 0.45 * twinkle
        const color = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`

        c.beginPath()
        c.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        c.fillStyle = color
        c.fill()
      }
    }

    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      window.clearInterval(morphInterval)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}