"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatePollModal } from "@/components/polls/create-poll-modal"
import { usePollStore, type Poll } from "@/store/poll-store"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"
import { Plus, ArrowLeft, BarChart2, Clock, Users, Trash2, Edit, Trophy, Loader2, Vote } from "lucide-react"
import { toast } from "sonner"

function PollMiniCard({ poll, onDelete }: { poll: Poll; onDelete: () => void }) {
  const { cancelPoll } = usePollStore()
  const countdown = useCountdown(poll.endTime)
  const isEnded = poll.status === "ended" || countdown.isExpired
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce sondage ?")) return

    setIsDeleting(true)
    try {
      const success = await cancelPoll(poll.id)
      if (success) {
        toast.success("Sondage supprimé")
        onDelete()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // Parse options for display
  const optionsWithStats = poll.options.map((option) => {
    const result = poll.results?.results?.find(r => r.text === option.text)
    return {
      ...option,
      votes: result?.votes || option.votes || 0,
      percentage: result?.percentage || option.percentage || 0,
    }
  })

  const winningOption = isEnded && optionsWithStats.length > 0
    ? optionsWithStats.reduce((prev, curr) => (prev.votes > curr.votes ? prev : curr))
    : null

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isEnded ? "destructive" : "default"} className={!isEnded ? "bg-green-500" : ""}>
                {isEnded ? "Terminé" : "Actif"}
              </Badge>
              {poll.isPublic ? <Badge variant="outline">Public</Badge> : <Badge variant="secondary">Privé</Badge>}
            </div>

            <h3 className="font-semibold text-lg truncate">{poll.question}</h3>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              {!isEnded ? (
                <span className={cn("flex items-center gap-1", countdown.minutes < 30 && "text-orange-500")}>
                  <Clock className="h-4 w-4" />
                  {countdown.formatted}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Terminé le {new Date(poll.endTime).toLocaleDateString("fr-FR")}
                </span>
              )}
              <span className="flex items-center gap-1">
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
              </div>
            )}

            {!isEnded && optionsWithStats.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground">Aperçu rapide :</p>
                {optionsWithStats.slice(0, 2).map((opt) => (
                  <div key={opt.index} className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${opt.percentage}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium w-20 truncate">{opt.text}</span>
                    <span className="text-xs text-muted-foreground w-8 text-right">{opt.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
            asChild
          >
            <Link href={`/dashboard/my-polls/${poll.id}/stats`}>
              <BarChart2 className="h-4 w-4 mr-2" />
              Voir Stats
            </Link>
          </Button>
          {!isEnded && (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 bg-transparent"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyPollsPage() {
  const { myPolls, fetchMyPolls, isLoading } = usePollStore()
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadPolls = async () => {
    await fetchMyPolls()
  }

  useEffect(() => {
    loadPolls()
  }, [])

  const filteredPolls = myPolls.filter((poll) => {
    const isEnded = poll.status === "ended" || new Date(poll.endTime) <= new Date()
    if (filter === "all") return true
    if (filter === "active") return !isEnded && poll.status === "active"
    if (filter === "ended") return isEnded || poll.status === "ended"
    return true
  })

  const activePollsCount = myPolls.filter((p) => p.status === "active" && new Date(p.endTime) > new Date()).length
  const endedPollsCount = myPolls.filter((p) => p.status === "ended" || new Date(p.endTime) <= new Date()).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mes Sondages</h1>
            <p className="text-muted-foreground text-sm">{myPolls.length} sondages au total</p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un sondage
        </Button>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Tous ({myPolls.length})</TabsTrigger>
          <TabsTrigger value="active">Actifs ({activePollsCount})</TabsTrigger>
          <TabsTrigger value="ended">Terminés ({endedPollsCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === "all" ? "Aucun sondage créé" : `Aucun sondage ${filter === "active" ? "actif" : "terminé"}`}
          </h3>
          <p className="text-muted-foreground mb-4">
            {filter === "all" && "Créez votre premier sondage pour commencer !"}
          </p>
          {filter === "all" && (
            <Button
              onClick={() => setIsModalOpen(true)}
              style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un sondage
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPolls.map((poll) => (
            <PollMiniCard key={poll.id} poll={poll} onDelete={loadPolls} />
          ))}
        </div>
      )}

      <CreatePollModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={loadPolls} />
    </div>
  )
}
