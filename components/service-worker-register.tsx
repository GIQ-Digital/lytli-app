"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    // Dev chunks aren't content-hashed, so caching them would serve stale code during HMR.
    if (process.env.NODE_ENV !== "production") return
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {})
  }, [])

  return null
}
