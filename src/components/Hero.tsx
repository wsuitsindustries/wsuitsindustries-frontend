import { useState, useEffect } from "react"
import FlockBackground from "./FlockBackground"

export default function Hero() {
  const [typed, setTyped] = useState("")
  const fullText = "Building Africa's Technological Haven"
  const accentPart = "Technological Haven"
  const accentIdx = fullText.indexOf(accentPart)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let i = 1
    let dir = 1

    function tick() {
      setTyped(fullText.slice(0, i))
      i += dir
      if (i > fullText.length) {
        dir = -1
        timer = setTimeout(tick, 1200)
        return
      }
      if (i < 1) {
        dir = 1
        timer = setTimeout(tick, 400)
        return
      }
      timer = setTimeout(tick, 55)
    }

    const delay = setTimeout(tick, 2800)
    return () => {
      clearTimeout(delay)
      clearTimeout(timer)
    }
  }, [])

  return (
    <section className="relative h-dvh flex flex-col md:grid md:grid-cols-2 md:items-center max-md:items-start max-md:pt-32 bg-white dark:bg-black snap-start">
      <div className="relative z-10 max-md:mx-auto max-md:max-w-6xl max-md:px-4 sm:px-6 md:flex md:flex-col md:justify-center md:px-8 md:pl-12 lg:pl-16 xl:pl-24 md:pt-20 text-center md:text-left">
        <h1 className="text-[clamp(2.4rem,10vw,5rem)] md:text-[clamp(2.8rem,5vw,6rem)] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.05] min-h-[1.2em]">
          <span>{typed.slice(0, accentIdx)}</span>
          {typed.length > accentIdx && (
            <span className="text-accent">{typed.slice(accentIdx)}</span>
          )}
          <span className="inline-block w-[3px] h-[1em] ml-1 bg-accent align-text-bottom animate-pulse" />
        </h1>

        <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3 sm:gap-4">
          <a
            href="#vision"
            className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-10 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 transition-all hover:border-gray-400 dark:hover:border-gray-400 w-full sm:w-auto"
          >
            Our Vision
          </a>
        </div>
      </div>

      <div className="max-md:relative max-md:flex-1 max-md:w-full md:absolute md:inset-0">
        <FlockBackground />
      </div>

      <div className="hidden md:block" />
    </section>
  )
}
