"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePollStore, type Poll } from "@/store/poll-store"
import {
  ArrowLeft, Loader2, Vote, HelpCircle, Trophy,
  Calendar, Users, CheckCircle2, TrendingUp,
  ChevronRight, BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function HistoryPage() {
  const { votesHistory, pollsHistory, fetchEnhancedHistory, isLoading } = usePollStore()
  const [activeTab, setActiveTab] = useState<"votes" | "polls">("votes")

  useEffect(() => {
    fetchEnhancedHistory()
  }, [])

  const currentList = activeTab === "votes" ? votesHistory : pollsHistory

  // History Item Component (Feed Style)
  const HistoryItem = ({ poll }: { poll: Poll }) => {
    const isEnded = new Date(poll.endTime) <= new Date() || poll.status === 'ended'

    // Calculate results if available
    const results = poll.results?.results || []
    const totalVotes = poll.results?.totalVotes || poll.totalVotes || 0

    // Find winner
    const winningOption = isEnded && results.length > 0
      ? [...results].sort((a, b) => b.votes - a.votes)[0]
      : null

    return (
      <div className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <div className="p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                {poll.question}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(poll.createdAt), "d MMMM yyyy", { locale: fr })}
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                  <Users className="h-3 w-3" />
                  {totalVotes} votes
                </span>
                {isEnded ? (
                  <span className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full">
                    Terminé
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full animate-pulse-slow">
                    En cours
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/dashboard/polls/${poll.id}`}
              className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110 active:scale-95 shrink-0"
            >
              <ChevronRight className="h-6 w-6" />
            </Link>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((option, idx) => {
                const isWinner = winningOption && winningOption.text === option.text
                const isMyVote = poll.myVote !== undefined && (poll.myVote === option.index || poll.myVote === idx + 1)

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 px-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {isMyVote && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                        <span className={cn(
                          "text-sm font-bold truncate",
                          isWinner ? "text-amber-600 dark:text-amber-400" : "text-foreground/80",
                          isMyVote && "text-primary"
                        )}>
                          {option.text}
                        </span>
                        {isWinner && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Gagnant</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-black tabular-nums">{option.percentage}%</span>
                    </div>

                    {/* Thicker Progress Bar */}
                    <div className={cn(
                      "h-4 w-full bg-muted/30 rounded-full overflow-hidden relative border border-border/10",
                      isWinner && "ring-2 ring-amber-500/20 bg-amber-500/5"
                    )}>
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out relative",
                          isWinner ? "bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-primary/80"
                        )}
                        style={{ width: `${option.percentage}%` }}
                      >
                        {/* Glass overlay on the bar */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground italic">
                  Les résultats ne sont pas encore disponibles pour ce sondage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16 animate-in fade-in duration-1000">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/10 shadow-2xl p-8 lg:p-12">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-background/50 border border-border/50 shadow-sm" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-6 w-6" />
                  </Link>
                </Button>
                <div className="h-1 w-12 bg-primary rounded-full" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-tight">
                Historique de <span className="text-primary">Participation</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                Consultez vos votes passés et les sondages auxquels vous avez contribué dans vos groupes.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-4 bg-background/60 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-border/50 shadow-lg">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center ring-1 ring-blue-500/20">
                  <Vote className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-foreground">{votesHistory.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sondages Votés</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background/60 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-border/50 shadow-lg">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center ring-1 ring-purple-500/20">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-foreground">{pollsHistory.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sondages Créés</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] group-hover:blur-[100px] transition-all opacity-50" />
            <img
              src="/history-icon.png"
              alt="Historique"
              className="relative z-10 w-48 h-48 lg:w-72 lg:h-72 object-contain animate-float drop-shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)]"
            />
          </div>
        </div>
      </section>

      {/* Navigation Pills */}
      <div className="flex justify-center">
        <div className="flex bg-muted/30 p-1.5 rounded-[2rem] border border-border/50 shadow-inner">
          <button
            onClick={() => setActiveTab("votes")}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
              activeTab === "votes"
                ? "bg-card text-primary shadow-xl ring-1 ring-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Vote className={cn("h-4 w-4", activeTab === "votes" ? "text-primary" : "text-muted-foreground/50")} />
            Mes Votes
            <span className={cn(
              "ml-1 px-2 py-0.5 rounded-full text-[10px]",
              activeTab === "votes" ? "bg-primary/10" : "bg-muted text-muted-foreground"
            )}>
              {votesHistory.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("polls")}
            className={cn(
              "px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
              activeTab === "polls"
                ? "bg-card text-primary shadow-xl ring-1 ring-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HelpCircle className={cn("h-4 w-4", activeTab === "polls" ? "text-primary" : "text-muted-foreground/50")} />
            Mes Sondages
            <span className={cn(
              "ml-1 px-2 py-0.5 rounded-full text-[10px]",
              activeTab === "polls" ? "bg-primary/10" : "bg-muted text-muted-foreground"
            )}>
              {pollsHistory.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Feed */}
      <div className="max-w-3xl mx-auto space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50">Récupération de vos données...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in zoom-in duration-700 bg-card/20 rounded-[3rem] border border-dashed border-border">
            <img
              src="/history-icon.png"
              alt="Vide"
              className="w-32 h-32 object-contain opacity-20 grayscale"
            />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-foreground/80">Rien à afficher</h3>
              <p className="text-muted-foreground max-w-xs font-medium">
                {activeTab === "votes"
                  ? "Vous n'avez pas encore voté sur des sondages."
                  : "Vous n'avez pas encore créé de sondages ou de votes."}
              </p>
              <Button className="mt-4 rounded-xl font-bold" asChild>
                <Link href="/dashboard">Commencer maintenant</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                Affichage de {currentList.length} résultat{currentList.length > 1 ? "s" : ""} {activeTab === "votes" ? "récents" : "créés"}
              </p>
              <div className="h-px flex-1 bg-border/20" />
            </div>
            {currentList.map((poll) => (
              <HistoryItem key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

