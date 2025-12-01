"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CodeInput } from "@/components/auth/code-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { authApi } from "@/lib/api"
import { useCountdown } from "@/hooks/use-countdown"
import { Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { login } = useAuthStore()

  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [expiresAt, setExpiresAt] = useState(() => new Date(Date.now() + 10 * 60 * 1000).toISOString())

  const countdown = useCountdown(expiresAt)

  useEffect(() => {
    if (!email) {
      router.push("/register")
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
      const result = await authApi.verifyEmail({ email, code })
      login(result.user, result.accessToken)
      toast.success("Email vérifié avec succès !")
      router.push("/dashboard")
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
      await authApi.resendCode(email)
      toast.success("Nouveau code envoyé !")
      setExpiresAt(new Date(Date.now() + 10 * 60 * 1000).toISOString())
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
        <CardContent className="p-8 text-center">
          <div
            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, var(--primary-100), var(--primary-50))` }}
          >
            <Mail className="h-10 w-10" style={{ color: "var(--primary)" }} />
          </div>

          <h1 className="text-2xl font-bold mb-2">Vérifiez votre email</h1>
          <p className="text-muted-foreground mb-2">Un code de vérification a été envoyé à</p>
          <p className="font-medium mb-6" style={{ color: "var(--primary)" }}>
            {email}
          </p>

          <div
            className={cn(
              "flex items-center justify-center gap-2 mb-8 text-sm font-medium",
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

          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
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
            </p>

            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier l'email
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  )
}
