"use client"

import { useThemeStore } from "@/store/theme-store"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-300",
        theme === "light" ? "bg-slate-200" : "bg-slate-700",
        className,
      )}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          "absolute left-1.5 h-4 w-4 transition-all duration-300",
          theme === "light" ? "text-amber-500 scale-110" : "text-slate-500 scale-100",
        )}
      />
      <Moon
        className={cn(
          "absolute right-1.5 h-4 w-4 transition-all duration-300",
          theme === "dark" ? "text-blue-400 scale-110" : "text-slate-400 scale-100",
        )}
      />
      <span
        className={cn(
          "h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300",
          theme === "dark" ? "translate-x-8" : "translate-x-0",
        )}
      />
    </button>
  )
}
