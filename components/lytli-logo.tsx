import { cn } from "@/lib/utils"

export function LytliLogo({ size = 52, className }: { size?: number; className?: string }) {
  const radius = size * 0.22
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      role="img"
      aria-label="Lytli"
    >
      <rect width="200" height="200" rx={radius * (200 / size)} ry={radius * (200 / size)} fill="#E85D75" />
      <path
        d="M100 48 C78 48 58 66 58 90 C58 112 74 126 100 152 C126 126 142 112 142 90 C142 66 122 48 100 48Z"
        fill="none"
        stroke="white"
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <circle cx="100" cy="165" r="4.5" fill="white" />
      <circle cx="100" cy="180" r="3" fill="white" />
    </svg>
  )
}
