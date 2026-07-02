import { useState, useEffect } from "react"

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2500)
    const t2 = setTimeout(() => setVisible(false), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg
        viewBox="0 6 92 52"
        className="h-28 w-auto sm:h-32"
        aria-label="W"
      >
        <defs>
          <linearGradient id="loader-w-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#0061ff" />
          </linearGradient>
        </defs>
        <g transform="scale(1, -1) translate(0, -60)">
          <path
            d="M 6 48 L 26 8 L 46 34 L 66 8 L 86 48"
            stroke="url(#loader-w-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="180"
            strokeDashoffset="180"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="180"
              to="0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>

        </g>
      </svg>
    </div>
  )
}
