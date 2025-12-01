"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, text: "", color: "" }

    let score = 0

    // Length checks
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1

    if (score <= 2) return { level: 1, text: "Trop faible", color: "bg-red-500" }
    if (score <= 3) return { level: 2, text: "Faible", color: "bg-orange-500" }
    if (score <= 4) return { level: 3, text: "Moyen", color: "bg-yellow-500" }
    if (score <= 5) return { level: 4, text: "Fort", color: "bg-green-500" }
    return { level: 5, text: "Excellent !", color: "bg-emerald-500" }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= strength.level ? strength.color : "bg-muted",
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs font-medium",
          strength.level <= 2 ? "text-red-500" : strength.level === 3 ? "text-yellow-600" : "text-green-600",
        )}
      >
        Force du mot de passe : {strength.text}
      </p>
    </div>
  )
}
