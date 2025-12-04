"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const criteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
    }
  }, [password])

  const strength = useMemo(() => {
    if (!password) return { level: 0, text: "", color: "" }

    let score = 0

    // Length checks
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Complexity checks
    if (criteria.hasLowerCase) score += 1
    if (criteria.hasUpperCase) score += 1
    if (criteria.hasNumber) score += 1
    if (criteria.hasSpecialChar) score += 1

    if (score <= 2) return { level: 1, text: "Trop faible", color: "bg-red-500" }
    if (score <= 3) return { level: 2, text: "Faible", color: "bg-orange-500" }
    if (score <= 4) return { level: 3, text: "Moyen", color: "bg-yellow-500" }
    if (score <= 5) return { level: 4, text: "Fort", color: "bg-green-500" }
    return { level: 5, text: "Excellent !", color: "bg-emerald-500" }
  }, [password, criteria])

  if (!password) return null

  return (
    <div className="space-y-2">
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

      {/* Critères de validation */}
      <div className="space-y-1 text-xs">
        <CriteriaItem met={criteria.minLength} text="Au moins 8 caractères" />
        <CriteriaItem met={criteria.hasUpperCase} text="Au moins une majuscule (A-Z)" />
        <CriteriaItem met={criteria.hasLowerCase} text="Au moins une minuscule (a-z)" />
        <CriteriaItem met={criteria.hasNumber} text="Au moins un chiffre (0-9)" />
        <CriteriaItem met={criteria.hasSpecialChar} text="Au moins un caractère spécial (!, @, #, $, %, etc.)" />
      </div>
    </div>
  )
}

function CriteriaItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", met ? "text-green-600" : "text-muted-foreground")}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  )
}
