import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { LanguageProvider } from "@/components/language-provider"
import "./globals.css"

export const metadata: Metadata = {
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
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }, { url: "/icon-192.png" }],
    apple: "/icon-192.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#2D9E6B",
  width: "device-width",
  initialScale: 1,
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
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
