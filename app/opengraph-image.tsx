import { ImageResponse } from "next/og"

export const alt = "Lytli — Caregiving made lighter"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="240" height="240" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="44" ry="44" fill="#E85D75" />
          <path
            d="M100 48 C78 48 58 66 58 90 C58 112 74 126 100 152 C126 126 142 112 142 90 C142 66 122 48 100 48Z"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="165" r="4.5" fill="white" />
          <circle cx="100" cy="180" r="3" fill="white" />
        </svg>
        <div style={{ marginTop: 40, fontSize: 88, fontWeight: 700, color: "#2D9E6B" }}>Lytli</div>
        <div style={{ marginTop: 8, fontSize: 36, color: "#5A6B62" }}>Caregiving made lighter</div>
      </div>
    ),
    size,
  )
}
