"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { pollsApi } from "@/lib/api"
import type { Poll } from "@/store/poll-store"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"
import { ArrowLeft, Clock, Check, Trophy, Users, Loader2, History, BarChart3 } from "lucide-react"

function HistoryPollCard({ poll }: { poll: Poll }) {
  const countdown = useCountdown(poll.endTime)
  const isEnded = poll.status === "ended" || countdown.isExpired

  const myVoteOption = poll.options.find((o) => o.index === poll.myVote)
  const winningOption = isEnded ? poll.options.reduce((prev, curr) => (prev.votes > curr.votes ? prev : curr)) : null

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--primary-100)" }}
          >
            <Check className="h-5 w-5" style={{ color: "var(--primary)" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isEnded ? "destructive" : "default"} className={!isEnded ? "bg-green-500" : ""}>
                {isEnded ? "Terminé" : "Actif"}
              </Badge>
            </div>

            <h3 className="font-semibold truncate">{poll.question}</h3>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
              {myVoteOption && (
                <span className="flex items-center gap-1" style={{ color: "var(--primary)" }}>
                  <Check className="h-4 w-4" />
                  Voté : {myVoteOption.text}
                </span>
              )}

              {!isEnded ? (
                <span
                  className={cn(
                    "flex items-center gap-1 text-muted-foreground",
                    countdown.minutes < 30 && "text-orange-500",
                  )}
                >
                  <Clock className="h-4 w-4" />
                  {countdown.formatted}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(poll.endTime).toLocaleDateString("fr-FR")}
                </span>
              )}

              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {poll.totalVotes} votes
              </span>
            </div>

            {isEnded && winningOption && (
              <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center gap-2 text-green-700 dark:text-green-400">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Gagnant : {winningOption.text} ({winningOption.percentage}%)
                </span>
                {winningOption.index === poll.myVote && (
                  <Badge className="bg-green-600 text-xs ml-auto">Votre choix !</Badge>
                )}
              </div>
            )}

            {/* Bouton pour voir les statistiques - disponible pour les sondages terminés et les créateurs */}
            {(isEnded || poll.isCreator) && (
              <div className="mt-3">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/dashboard/my-polls/${poll.id}/stats`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Voir les statistiques
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HistoryPage() {
  const [history, setHistory] = useState<{ active: Poll[]; ended: Poll[] }>({ active: [], ended: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      try {
        const data = await pollsApi.getHistory()
        setHistory(data)
      } catch (error) {
        console.error("Error loading history:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadHistory()
  }, [])

  const allPolls = [...history.active, ...history.ended]
  const displayedPolls = activeTab === "all" ? allPolls : activeTab === "active" ? history.active : history.ended

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Historique</h1>
          <p className="text-muted-foreground text-sm">Sondages auxquels vous avez participé</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous ({allPolls.length})</TabsTrigger>
          <TabsTrigger value="active">Actifs ({history.active.length})</TabsTrigger>
          <TabsTrigger value="ended">Terminés ({history.ended.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : displayedPolls.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
          <p className="text-muted-foreground mb-4">Vous n'avez pas encore participé à des sondages.</p>
          <Button asChild>
            <Link href="/dashboard">Découvrir les sondages</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPolls.map((poll) => (
            <HistoryPollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  )
}
