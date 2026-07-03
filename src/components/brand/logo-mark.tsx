import { useId } from 'react'

// Brand mark (location pin + hidden-landscape scene). Inline SVG so it can be
// sized with className and ships with no extra request. Keep in sync with
// public/brand/logo-mark.svg, the source used to generate all raster icons.
export function LogoMark({ className }: { className?: string }) {
  // The mark renders more than once per page (navbar, footer) — ids must not collide.
  const clipId = useId()
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true" role="img">
      <defs>
        <clipPath id={clipId}>
          <circle cx="60" cy="54" r="37" />
        </clipPath>
      </defs>
      <path d="M60 146 C60 146 14 88 14 54 A46 46 0 1 1 106 54 C106 88 60 146 60 146 Z" fill="#1F3D2E" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="14" y="8" width="92" height="92" fill="#F7E9C4" />
        <circle cx="75" cy="37" r="13" fill="#F39C12" />
        <path d="M42 30 q4 -4 8 0" stroke="#1F3D2E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M55 25 q4 -4 8 0" stroke="#1F3D2E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <polygon points="16,76 46,38 76,76" fill="#4C6B3D" />
        <polygon points="44,76 76,42 108,76" fill="#1F3D2E" />
        <polygon points="74,52 78.5,52 81,78 71.5,78" fill="#FFFFFF" />
        <polygon points="21,76 30,48 39,76" fill="#4C6B3D" />
        <polygon points="34,76 42,56 50,76" fill="#3B5533" />
        <rect x="14" y="76" width="92" height="24" fill="#4C6B3D" />
        <ellipse cx="76" cy="79.5" rx="12" ry="3" fill="#FFFFFF" opacity="0.9" />
      </g>
      <circle cx="60" cy="54" r="38" fill="none" stroke="#F7E9C4" strokeWidth="3.5" />
      <circle cx="60" cy="113" r="5" fill="#F7E9C4" />
    </svg>
  )
}
