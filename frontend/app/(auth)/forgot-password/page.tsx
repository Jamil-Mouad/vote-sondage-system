"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { authApi } from "@/lib/api"
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authApi.forgotPassword(email)
      toast.success("Code de réinitialisation envoyé !")
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>

          <div className="text-center mb-8">
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, var(--primary-100), var(--primary-50))` }}
            >
              <Lock className="h-8 w-8" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Mot de passe oublié ?</h1>
            <p className="text-muted-foreground">
              Pas de panique ! Entrez votre email et nous vous enverrons un code de réinitialisation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Votre email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              style={{
                background: `linear-gradient(135deg, var(--primary), var(--primary-700))`,
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Envoyer le code
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
