"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PollCard } from "@/components/polls/poll-card"
import { CreatePollModal } from "@/components/polls/create-poll-modal"
import { PollCardSkeleton } from "@/components/polls/poll-card-skeleton"
import { usePollStore } from "@/store/poll-store"
import { useAuthStore } from "@/store/auth-store"
import { useThemeStore } from "@/store/theme-store"
import { Plus, Search, RefreshCw, BarChart3, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [isPollModalOpen, setIsPollModalOpen] = useState(false)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { user } = useAuthStore()
  const { polls, fetchPublicPolls, isLoading: pollsLoading } = usePollStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    fetchPublicPolls({ status: "active" })
  }, [])

  const handleSearch = () => {
    fetchPublicPolls({ status: "active", search: searchQuery })
  }

  const handleRefresh = () => {
    setSearchQuery("")
    fetchPublicPolls({ status: "active" })
  }

  // Determine illustration based on theme
  const heroDescription = "Découvrez ce que pense la communauté ou lancez vos propres débats en quelques clics."

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-[var(--primary-700)] shadow-2xl dark:shadow-primary/20 p-8 sm:p-12 mb-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-6 text-center md:text-left text-white">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-sm mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Espace Communautaire</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Bonjour {user?.firstName || user?.name || "Utilisateur"},<br />
                <span className="text-white/90">Prêt à donner votre avis ?</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-lg mx-auto md:mx-0">
                {heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Button
                onClick={() => setIsPollModalOpen(true)}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer un sondage
              </Button>
              <Button
                onClick={() => setIsVoteModalOpen(true)}
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-bold rounded-full backdrop-blur-md shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Créer un vote
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('polls-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-white/40 text-white hover:bg-white/10 rounded-full backdrop-blur-sm"
              >
                Voir les tendances
              </Button>
            </div>
          </div>

          <div className="relative w-96 h-96 md:w-[500px] md:h-[500px] lg:w-[700px] lg:h-[700px] lg:-mr-32 lg:-my-24 flex-shrink-0 animate-in slide-in-from-right-12 duration-1000">
            {/* Glow Effect using user's light accent color */}
            <div className="absolute inset-0 bg-[var(--primary-100)] blur-[100px] rounded-full animate-pulse opacity-50 mix-blend-screen" />

            <div className="relative w-full h-full transform transition-transform hover:scale-105 duration-500 ease-out"
              style={{ animation: 'float 6s ease-in-out infinite' }}>
              <Image
                src={theme === 'dark' ? "/sondage-icon-dark.png" : "/sondage-icon-light-public.png"}
                alt="3D Poll Illustration"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2" id="polls-grid">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Sondages Récents
          </h2>
          <p className="text-muted-foreground text-sm">Les derniers sujets chauds de la plateforme</p>
        </div>

        {/* Search bar styling enhanced */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input
              placeholder="Rechercher un sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-11 bg-background border-border/60 shadow-sm rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300 group-hover:border-primary/50"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} className="h-11 w-11 rounded-xl border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {pollsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <PollCardSkeleton key={i} />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-24 bg-card/50 backdrop-blur-sm rounded-3xl border border-dashed border-border/60 shadow-sm animate-in fade-in zoom-in-95">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Aucun sondage trouvé</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">Il semble que c'est calme par ici. Soyez le premier à lancer une discussion !</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setIsPollModalOpen(true)}
                size="lg"
                className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Lancer un sondage
              </Button>
              <Button
                onClick={() => setIsVoteModalOpen(true)}
                size="lg"
                variant="outline"
                className="rounded-full border-primary/20 text-primary hover:bg-primary/5 transition-all hover:scale-105"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Lancer un vote
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} onVote={() => fetchPublicPolls({ status: "active" })} />
            ))}
          </div>
        )}
      </div>

      <CreatePollModal mode="poll" open={isPollModalOpen} onOpenChange={setIsPollModalOpen} onSuccess={() => fetchPublicPolls({ status: "active" })} />
      <CreatePollModal mode="vote" open={isVoteModalOpen} onOpenChange={setIsVoteModalOpen} onSuccess={() => fetchPublicPolls({ status: "active" })} />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
      `}</style>
    </div>
  )
}
