"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

    navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
      // Offline support is a progressive enhancement - failing silently
      // keeps the app fully usable without it.
    });
  }, []);

  return null;
}
