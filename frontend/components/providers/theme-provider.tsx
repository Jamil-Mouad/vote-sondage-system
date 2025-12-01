"use client"

import * as React from "react"
import { useThemeStore } from "@/store/theme-store"
import { themeColors } from "@/lib/theme-config"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, accentColor } = useThemeStore()

  React.useEffect(() => {
    const root = document.documentElement

    // Apply theme class
    root.classList.remove("light", "dark")
    root.classList.add(theme)

    // Apply accent color CSS variables
    const colors = themeColors[accentColor]
    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--primary-50", colors.primary50)
    root.style.setProperty("--primary-100", colors.primary100)
    root.style.setProperty("--primary-500", colors.primary500)
    root.style.setProperty("--primary-600", colors.primary600)
    root.style.setProperty("--primary-700", colors.primary700)
  }, [theme, accentColor])

  return <>{children}</>
}
