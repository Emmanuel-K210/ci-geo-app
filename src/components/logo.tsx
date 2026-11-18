import { useId } from "react"

/** The country's silhouette (simplified, scripts/make-logo.mjs). */
const OUTLINE =
  "M20.2,20.8L23.6,18.5L29.2,16.8L34.3,14L42.7,16.3L50.6,16.8L55.1,18.5L59.6,24.8L64.6,25.9L71.4,23.1L77.5,24.8L82,27.6L84.3,42.3L79.8,45.7L76.4,58.2L77.5,66.2L77.5,74.1L80.4,77.5L70.8,76.9L60.7,76.4L51.7,77.5L42.7,80.9L33.7,84.3L27.5,86L27.5,77.5L23.6,70.7L18,63.9L15.7,56L17.4,49.1L17.4,42.3L24.7,38.9L23,31L20.2,25.9Z"

/** Culture Ivoire's mark: the silhouette filled with the flag's bands. */
export function LogoMark({ className }: { className?: string }) {
  const clip = useId()
  return (
    <svg viewBox="12 10 76 80" aria-hidden className={className}>
      <clipPath id={clip}>
        <path d={OUTLINE} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x="14.7" y="0" width="23.9" height="100" fill="#f77f00" />
        <rect x="38.6" y="0" width="22.9" height="100" fill="#ffffff" />
        <rect x="61.4" y="0" width="23.9" height="100" fill="#009e60" />
      </g>
      <path
        d={OUTLINE}
        fill="none"
        stroke="var(--ink)"
        strokeOpacity=".85"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Mark and name; the name sits on two lines where space is short. */
export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="size-9 flex-none" />
      {/* One line where there is room: tablets, wide desktops. */}
      <span className="flex flex-col gap-0.5 font-display text-[15px] leading-none font-bold tracking-tight sm:flex-row sm:gap-1.5 sm:text-lg lg:flex-col lg:gap-0.5 lg:text-[15px] xl:flex-row xl:gap-1.5 xl:text-lg">
        <span>Culture</span>
        <span className="text-orange">Ivoire</span>
      </span>
    </span>
  )
}
