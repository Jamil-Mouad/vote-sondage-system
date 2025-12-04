"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { PollCard } from "@/components/polls/poll-card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BarChart3, LogIn, UserPlus } from "lucide-react"
import type { Poll } from "@/store/poll-store"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Toujours charger les sondages publics, même si authentifié
    // L'utilisateur peut vouloir les voir avant d'aller au dashboard
    loadPublicPolls()
  }, [])

  const loadPublicPolls = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/polls/public")
      if (response.ok) {
        const result = await response.json()
        const rawPolls = result.data || []

        // Transformer les données pour correspondre au format attendu
        const formattedPolls = rawPolls.map((poll: any) => ({
          id: poll.id,
          question: poll.question,
          description: poll.description,
          options: Array.isArray(poll.options)
            ? poll.options.map((opt: string, index: number) => ({
                index,
                text: opt,
                votes: 0,
                percentage: 0,
              }))
            : [],
          endTime: poll.end_time,
          status: poll.status,
          isPublic: poll.is_public,
          groupId: poll.group_id,
          totalVotes: poll.totalVotes || 0,
          createdBy: {
            id: poll.created_by,
            username: poll.created_by_username || "Utilisateur",
            avatarUrl: poll.created_by_avatar,
          },
          hasVoted: poll.hasVoted || false,
          myVote: poll.myVote,
          isCreator: false, // Non connecté donc pas le créateur
          createdAt: poll.created_at,
        }))

        setPolls(formattedPolls)
      }
    } catch (error) {
      console.error("Erreur de chargement:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header public */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2" style={{ color: "var(--primary)" }}>
            <BarChart3 className="h-8 w-8" />
            <span className="text-xl font-bold">VotePoll</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild style={{ background: "var(--primary)", color: "white" }}>
                <Link href="/dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
                <Button asChild style={{ background: "var(--primary)", color: "white" }}>
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    S'inscrire
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--primary)" }}>
              Bienvenue sur VotePoll
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Découvrez les sondages publics et participez en vous connectant
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des sondages...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun sondage public pour le moment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
