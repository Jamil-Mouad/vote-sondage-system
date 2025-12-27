"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      const result = await authApi.forgotPassword(email)
      toast.success("Code de réinitialisation envoyé !")

      const expiresAt = result.data?.expiresAt ? `&expiresAt=${encodeURIComponent(result.data.expiresAt)}` : ''
      router.push(`/verify-reset-code?email=${encodeURIComponent(email)}${expiresAt}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[360px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50 hover:text-white transition-all mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Mot de passe oublié ?</h1>
            <p className="text-white/60 text-sm">
              Entrez votre email et nous vous enverrons un code de réinitialisation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-1 group relative">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-white/50 ml-1 group-focus-within:text-white transition-colors">
              Votre Email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 bg-transparent border-0 border-b border-white/20 rounded-none px-0 text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-white transition-all text-base"
                required
              />
              <Mail className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-sm font-bold uppercase tracking-[0.2em] text-white rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
            style={{
              background: `linear-gradient(90deg, var(--primary-600) 0%, var(--primary-700) 100%)`,
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                Envoyer le code
              </>
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
