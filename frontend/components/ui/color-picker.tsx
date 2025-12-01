"use client"

import { useThemeStore } from "@/store/theme-store"
import { themeColors, type AccentColor } from "@/lib/theme-config"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function ColorPicker({ className }: { className?: string }) {
  const { accentColor, setAccentColor } = useThemeStore()

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {(Object.keys(themeColors) as AccentColor[]).map((color) => (
        <button
          key={color}
          onClick={() => setAccentColor(color)}
          className={cn(
            "relative h-8 w-8 rounded-full transition-transform hover:scale-110",
            accentColor === color && "ring-2 ring-offset-2 ring-offset-background",
          )}
          style={{ backgroundColor: themeColors[color].primary }}
          aria-label={themeColors[color].name}
          title={themeColors[color].name}
        >
          {accentColor === color && <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />}
        </button>
      ))}
    </div>
  )
}
