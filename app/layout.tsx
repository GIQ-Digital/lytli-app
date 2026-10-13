import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { LanguageProvider } from "@/components/language-provider"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import "./globals.css"

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Lytli — Caregiving made lighter",
  description: "Lytli is a wellness companion for caregivers. Caregiving made lighter.",
  generator: "v0.app",
  applicationName: "Lytli",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Lytli",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#2D9E6B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased bg-background">
        <LanguageProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col bg-background">
            {children}
          </div>
        </LanguageProvider>
        <ServiceWorkerRegister />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
