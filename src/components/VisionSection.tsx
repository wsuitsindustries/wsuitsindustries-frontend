import { useRef, useState, useEffect } from "react"

interface VisionCard {
  title: string
  desc: string
  image: string
}

const visionCards: VisionCard[] = [
  {
    title: "Smart Cities",
    desc: "AI-managed urban centers with autonomous transport, smart grids, and zero-waste systems.",
    image: "/assets/images/smart-city.png",
  },
  {
    title: "Green Energy",
    desc: "A continent powered entirely by renewable micro-grids — solar, wind, and hydro.",
    image: "/assets/images/green-energy.png",
  },
  {
    title: "Digital Education",
    desc: "Universal access to world-class education through offline-first AI tutors.",
    image: "/assets/images/digital-education.png",
  },
  {
    title: "Health for All",
    desc: "Portable AI diagnostics, drone-delivered medicine, and real-time epidemic prediction.",
    image: "/assets/images/health-for-all.png",
  },
  {
    title: "Space & Connectivity",
    desc: "African-built satellites providing free high-speed internet across the continent.",
    image: "/assets/images/space-connectivity.png",
  },
]

export default function VisionSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const update = () => {
    const el = trackRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(Math.min(idx, visionCards.length - 1))
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener("scroll", update)
    update()
    return () => el.removeEventListener("scroll", update)
  }, [])

  const scrollTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  return (
    <section id="vision" className="relative h-dvh bg-white dark:bg-black overflow-hidden snap-start">
      <div
        ref={trackRef}
        className="carousel-track flex flex-row overflow-x-auto snap-x snap-mandatory h-full"
      >
        {visionCards.map((card) => (
          <article
            key={card.title}
            className="carousel-slide relative w-full h-full shrink-0 snap-start bg-cover bg-center"
            style={{ backgroundImage: `url(${card.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="relative z-10 flex flex-col justify-end h-full px-6 sm:px-14 pb-16 sm:pb-20">
              <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
                {card.title}
              </h3>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
                {card.desc}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {visionCards.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === activeIndex
                ? "w-10 bg-accent"
                : "w-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
