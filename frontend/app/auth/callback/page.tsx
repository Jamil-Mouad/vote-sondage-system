"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer les tokens depuis l'URL
        const accessToken = searchParams.get("accessToken")
        const refreshToken = searchParams.get("refreshToken")
        const error = searchParams.get("error")

        if (error) {
          toast.error("Erreur lors de la connexion avec Google")
          router.push("/login")
          return
        }

        if (!accessToken) {
          toast.error("Tokens d'authentification manquants")
          router.push("/login")
          return
        }

        // Décoder le token JWT pour récupérer les informations utilisateur
        const payload = JSON.parse(atob(accessToken.split(".")[1]))

        // Sauvegarder les tokens dans localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken)
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken)
          }
          localStorage.setItem("userId", payload.id.toString())
        }

        // Connecter l'utilisateur dans le store
        useAuthStore.setState({
          user: {
            id: payload.id.toString(),
            name: payload.username,
            email: payload.email,
          },
          token: accessToken,
          isAuthenticated: true,
        })

        toast.success("Connexion avec Google réussie !")
        router.push("/dashboard")
      } catch (error) {
        console.error("Erreur lors du traitement du callback:", error)
        toast.error("Erreur lors de la connexion")
        router.push("/login")
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "var(--primary)" }} />
        <h2 className="text-xl font-semibold mb-2">Connexion en cours...</h2>
        <p className="text-muted-foreground">Veuillez patienter</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "var(--primary)" }} />
            <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
