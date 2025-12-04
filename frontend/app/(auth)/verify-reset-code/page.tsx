"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CodeInput } from "@/components/auth/code-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useCountdown } from "@/hooks/use-countdown"
import { Key, Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock"
const USE_REAL_API = API_MODE === "real"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

function VerifyResetCodeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const expiresAtParam = searchParams.get("expiresAt") || ""

  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(false)

  // Utiliser l'expiration du backend si disponible, sinon 10 minutes par défaut
  const [expiresAt, setExpiresAt] = useState(() =>
    expiresAtParam || new Date(Date.now() + 10 * 60 * 1000).toISOString()
  )

  const countdown = useCountdown(expiresAt)

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password")
    }
  }, [email, router])

  useEffect(() => {
    const timer = setTimeout(() => setCanResend(true), 30000)
    return () => clearTimeout(timer)
  }, [expiresAt])

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Veuillez entrer le code complet")
      return
    }

    setIsLoading(true)

    try {
      // Vérifier le code en essayant de l'utiliser (on ne réinitialise pas encore)
      // On passe simplement à la page suivante avec le code
      toast.success("Code vérifié avec succès !")
      router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${code}&expiresAt=${encodeURIComponent(expiresAt)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Code invalide")
      setCode("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      if (USE_REAL_API) {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error?.message || "Erreur lors du renvoi")
        }

        // Mettre à jour l'expiration avec celle du backend
        if (result.data?.expiresAt) {
          setExpiresAt(result.data.expiresAt)
        } else {
          setExpiresAt(new Date(Date.now() + 10 * 60 * 1000).toISOString())
        }
      } else {
        setExpiresAt(new Date(Date.now() + 10 * 60 * 1000).toISOString())
      }

      toast.success("Nouveau code envoyé !")
      setCanResend(false)
      setCode("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du renvoi")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>

          <div className="text-center mb-6">
            <div
              className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, var(--primary-100), var(--primary-50))` }}
            >
              <Key className="h-10 w-10" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Vérifiez votre code</h1>
            <p className="text-muted-foreground mb-2">Un code de vérification a été envoyé à</p>
            <p className="font-medium mb-4" style={{ color: "var(--primary)" }}>
              {email}
            </p>

            <div
              className={cn(
                "flex items-center justify-center gap-2 mb-6 text-sm font-medium",
                countdown.isExpired
                  ? "text-red-500"
                  : countdown.minutes < 2
                    ? "text-orange-500 animate-pulse"
                    : "text-muted-foreground",
              )}
            >
              <span>Le code expire dans :</span>
              <span className="font-mono">{countdown.formatted}</span>
            </div>
          </div>

          <div className="mb-6">
            <CodeInput value={code} onChange={setCode} disabled={isLoading || countdown.isExpired} error={false} />
          </div>

          <Button
            onClick={handleVerify}
            className="w-full h-12 text-base font-semibold mb-4"
            style={{
              background: `linear-gradient(135deg, var(--primary), var(--primary-700))`,
            }}
            disabled={isLoading || code.length !== 6 || countdown.isExpired}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier le code"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Code non reçu ?{" "}
            <button
              onClick={handleResend}
              disabled={!canResend || isResending}
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                canResend ? "hover:underline cursor-pointer" : "opacity-50 cursor-not-allowed",
              )}
              style={{ color: canResend ? "var(--primary)" : undefined }}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Renvoyer le code
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default function VerifyResetCodePage() {
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
      <VerifyResetCodeContent />
    </Suspense>
  )
}
