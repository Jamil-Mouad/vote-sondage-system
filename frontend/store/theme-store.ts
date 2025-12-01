import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AccentColor } from "@/lib/theme-config"

interface ThemeState {
  theme: "light" | "dark"
  accentColor: AccentColor
  setTheme: (theme: "light" | "dark") => void
  toggleTheme: () => void
  setAccentColor: (color: AccentColor) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      accentColor: "blue",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    {
      name: "theme-storage",
    },
  ),
)
