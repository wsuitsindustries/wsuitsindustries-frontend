import { useEffect, useRef } from "react"

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
}

const COUNT = 500
const FLEE_RADIUS = 120
const FLEE_FORCE = 10
const SPRING = 0.06
const DAMPING = 0.88

const PALETTES = [
  { h: 217, s: 91, l: 68 },
  { h: 217, s: 91, l: 60 },
  { h: 217, s: 100, l: 50 },
  { h: 210, s: 90, l: 65 },
  { h: 220, s: 85, l: 55 },
  { h: 217, s: 80, l: 72 },
  { h: 205, s: 90, l: 62 },
  { h: 217, s: 85, l: 45 },
]

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function drawLogo(ctx: CanvasRenderingContext2D, SW: number, SH: number) {
  const vbW = 92
  const vbH = 46
  const pad = SW * 0.08
  const scale = Math.min((SW - pad * 2) / vbW, (SH - pad * 2) / vbH)
  const ox = (SW - vbW * scale) / 2
  const oy = (SH - vbH * scale) / 2

  ctx.strokeStyle = "#000"
  ctx.lineWidth = 12 * scale
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  ctx.beginPath()
  ctx.moveTo(ox + 6 * scale, oy + (46 - 48 + 6) * scale)
  ctx.lineTo(ox + 26 * scale, oy + (46 - 8 + 6) * scale)
  ctx.lineTo(ox + 46 * scale, oy + (46 - 34 + 6) * scale)
  ctx.lineTo(ox + 66 * scale, oy + (46 - 8 + 6) * scale)
  ctx.lineTo(ox + 86 * scale, oy + (46 - 48 + 6) * scale)
  ctx.stroke()
}

function generateShapePoints(
  count: number,
  w: number,
  h: number
) {
  const SW = 400
  const SH = 300
  const offscreen = document.createElement("canvas")
  offscreen.width = SW
  offscreen.height = SH
  const octx = offscreen.getContext("2d")!

  octx.fillStyle = "#fff"
  octx.fillRect(0, 0, SW, SH)
  drawLogo(octx, SW, SH)

  const imageData = octx.getImageData(0, 0, SW, SH)
  const pixels = imageData.data
  const candidates: { x: number; y: number }[] = []

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

  const scale = (w * 1.0) / SW
  const shapeW = SW * scale
  const shapeH = SH * scale
  const ox = (w - shapeW) / 2
  const oy = (h - shapeH) / 2

  const result: { x: number; y: number }[] = []
  const denom = Math.max(candidates.length, 1)
  for (let i = 0; i < count; i++) {
    const c = candidates[i % denom]
    result.push({
      x: ox + c.x * scale,
      y: oy + c.y * scale,
    })
  }

  return result
}

export default function FooterBackground() {
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
    let animId = 0
    let frame = 0

    function init() {
      const pts = generateShapePoints(COUNT, w, h)
      particles = pts.map((pt, i) => {
        const p = PALETTES[i % PALETTES.length]
        return {
          x: pt.x,
          y: pt.y,
          targetX: pt.x,
          targetY: pt.y,
          vx: 0,
          vy: 0,
          size: rand(2.5, 5.0),
          hue: p.h + rand(-6, 6),
          sat: p.s + rand(-6, 6),
          light: p.l + rand(-8, 8),
          twinkleSpeed: rand(0.015, 0.045),
          twinklePhase: rand(0, Math.PI * 2),
        }
      })
    }

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (particles.length === 0) {
        init()
        return
      }

      const pts = generateShapePoints(COUNT, w, h)
      for (let i = 0; i < particles.length; i++) {
        particles[i].targetX = pts[i % pts.length].x
        particles[i].targetY = pts[i % pts.length].y
      }
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

    function tick() {
      animId = requestAnimationFrame(tick)
      frame++
      const { x: cx, y: cy } = cursorRef.current

      for (const p of particles) {
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
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
