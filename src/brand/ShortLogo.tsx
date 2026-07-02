interface ShortLogoProps {
  className?: string
}

export default function ShortLogo({ className = "" }: ShortLogoProps) {
  return (
    <svg
      viewBox="0 6 92 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="W"
    >
      <defs>
        <linearGradient id="w-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#0061ff" />
        </linearGradient>
      </defs>
      <g transform="scale(1, -1) translate(0, -60)">
        <path
          d="M 6 48 L 26 8 L 46 34 L 66 8 L 86 48"
          stroke="url(#w-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  )
}
