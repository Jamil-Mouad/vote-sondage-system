// Theme configuration based on the design documentation
export const themeColors = {
  blue: {
    name: "Bleu Océan",
    primary: "#3B82F6",
    primary50: "#EFF6FF",
    primary100: "#DBEAFE",
    primary500: "#3B82F6",
    primary600: "#2563EB",
    primary700: "#1D4ED8",
  },
  green: {
    name: "Vert Émeraude",
    primary: "#10B981",
    primary50: "#ECFDF5",
    primary100: "#D1FAE5",
    primary500: "#10B981",
    primary600: "#059669",
    primary700: "#047857",
  },
  gold: {
    name: "Or Royal",
    primary: "#F59E0B",
    primary50: "#FFFBEB",
    primary100: "#FEF3C7",
    primary500: "#F59E0B",
    primary600: "#D97706",
    primary700: "#B45309",
  },
  purple: {
    name: "Violet Mystique",
    primary: "#8B5CF6",
    primary50: "#F5F3FF",
    primary100: "#EDE9FE",
    primary500: "#8B5CF6",
    primary600: "#7C3AED",
    primary700: "#6D28D9",
  },
  red: {
    name: "Rouge Passion",
    primary: "#EF4444",
    primary50: "#FEF2F2",
    primary100: "#FEE2E2",
    primary500: "#EF4444",
    primary600: "#DC2626",
    primary700: "#B91C1C",
  },
  pink: {
    name: "Rose Pétale",
    primary: "#EC4899",
    primary50: "#FDF2F8",
    primary100: "#FCE7F3",
    primary500: "#EC4899",
    primary600: "#DB2777",
    primary700: "#BE185D",
  },
} as const

export type AccentColor = keyof typeof themeColors
