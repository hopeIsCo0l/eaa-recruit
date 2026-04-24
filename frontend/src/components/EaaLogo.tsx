interface EaaLogoProps {
  size?: number
  className?: string
}

export function EaaLogo({ size = 32, className }: EaaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EAA Recruit"
    >
      {/* Shield base */}
      <path
        d="M16 2L4 7v9c0 6.627 5.148 11.95 12 13 6.852-1.05 12-6.373 12-13V7L16 2z"
        fill="hsl(207 65% 40%)"
      />
      {/* Wing chevron */}
      <path
        d="M8 16l8-6 8 6-8 3-8-3z"
        fill="#c9a84c"
        opacity="0.9"
      />
      {/* Centre fuselage */}
      <rect x="15" y="10" width="2" height="12" rx="1" fill="white" opacity="0.9" />
    </svg>
  )
}
