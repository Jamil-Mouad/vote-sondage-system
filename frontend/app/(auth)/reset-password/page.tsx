"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CodeInput } from "@/components/auth/code-input"
import { PasswordStrength } from "@/components/auth/password-strength"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { authApi } from "@/lib/api"
import { useCountdown } from "@/hooks/use-countdown"
import { Key, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const countdown = useCountdown(expiresAt)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (code.length !== 6) {
      toast.error("Veuillez entrer le code complet")
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword({ email, code, newPassword: password })
      toast.success("Mot de passe réinitialisé avec succès !")
      router.push("/login")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la réinitialisation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, var(--primary-100), var(--primary-50))` }}
            >
              <Key className="h-8 w-8" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Créez votre nouveau mot de passe</h1>
            <p className="text-sm text-muted-foreground">
              Code envoyé à : <span className="font-medium">{email}</span>
            </p>
            <p
              className={cn(
                "text-sm mt-1",
                countdown.isExpired
                  ? "text-red-500"
                  : countdown.minutes < 2
                    ? "text-orange-500"
                    : "text-muted-foreground",
              )}
            >
              Expire dans : <span className="font-mono">{countdown.formatted}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Code de vérification</Label>
              <CodeInput value={code} onChange={setCode} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              style={{
                background: `linear-gradient(135deg, var(--primary), var(--primary-700))`,
              }}
              disabled={isLoading || countdown.isExpired}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Réinitialiser le mot de passe
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </CardContent>
          </Card>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
