"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { authApi } from "@/lib/api"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock"
const USE_REAL_API = API_MODE === "real"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  // Charger l'email sauvegardé au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("rememberedEmail")
      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }))
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await authApi.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      })

      // Gérer la sauvegarde de l'email
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      useAuthStore.setState({
        user: {
          id: result.user.id.toString(),
          name: result.user.username || "Utilisateur",
          email: result.user.email,
        },
        token: result.accessToken,
        isAuthenticated: true,
      })

      toast.success("Bon retour parmi nous !")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (USE_REAL_API) {
      try {
        const response = await fetch(API_BASE_URL.replace('/api', '') + '/api/auth/google', {
          method: 'HEAD',
          redirect: 'manual'
        }).catch(() => null);

        if (!response || response.status === 503) {
          toast.error("Google OAuth n'est pas configuré sur ce serveur.");
          return;
        }

        window.location.href = API_BASE_URL.replace('/api', '') + '/api/auth/google';
      } catch (error) {
        toast.error("Erreur lors de la connexion avec Google.");
      }
    } else {
      toast.info("OAuth Google non disponible en mode démo")
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[360px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Connexion</h1>
          <p className="text-white/60 text-sm">Entrez vos identifiants pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2 group relative">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-white/50 ml-4 group-focus-within:text-white transition-colors">
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white transition-all text-base"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
              </div>
            </div>

            <div className="space-y-2 group relative">
              <div className="flex items-center justify-between ml-4">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-white/50 group-focus-within:text-white transition-colors">
                  Mot de passe
                </label>
                <Link href="/forgot-password" title="Mot de passe oublié ?" className="text-xs font-medium text-white/40 hover:text-white transition-all">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-12 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white transition-all text-base"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/40 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <Lock className="h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-1">
            <Checkbox
              id="remember"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })}
              className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-primary-700 rounded-sm"
            />
            <label htmlFor="remember" className="text-xs text-white/60 cursor-pointer select-none">
              Se souvenir de moi
            </label>
          </div>

          <div className="space-y-4 pt-2">
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
                  Connexion...
                </>
              ) : (
                "Se Connecter"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-full transition-all flex items-center justify-center gap-3 text-sm font-medium"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-xs text-white/40 pt-4">
            Vous n'avez pas de compte ?{" "}
            <Link href="/register" className="text-white hover:underline font-bold ml-1">
              Inscrivez-vous
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
