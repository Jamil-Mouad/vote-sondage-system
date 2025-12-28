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
import { Plus, ArrowLeft, BarChart2, Clock, Users, Trash2, Edit, Trophy, Loader2, Vote, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

function PollMiniCard({ poll, onDelete }: { poll: Poll; onDelete: () => void }) {
  const { cancelPoll } = usePollStore()
  const countdown = useCountdown(poll.endTime)
  const isEnded = poll.status === "ended" || countdown.isExpired
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    <Card className="group relative overflow-hidden transition-all duration-300 border-none shadow-lg hover:shadow-xl hover:-translate-y-1 bg-card/60 backdrop-blur-md ring-1 ring-border/50 rounded-[2rem]">
      {/* Hover Delete Action */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 right-4 z-20 h-9 w-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>

      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Badge className={cn(
            "rounded-full px-3 py-0.5 border-none font-bold text-[10px] uppercase tracking-tighter",
            isEnded
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-green-500/10 text-green-600 dark:text-green-400"
          )}>
            {isEnded ? "Terminé" : "Actif"}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-bold border-muted-foreground/20 text-muted-foreground/80">
            {poll.isPublic ? "Public" : "Privé"}
          </Badge>
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="font-black text-xl leading-tight text-foreground tracking-tight line-clamp-2 min-h-[3rem]">
            {poll.question}
          </h3>

          <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {isEnded ? `Clos le ${new Date(poll.endTime).toLocaleDateString()}` : countdown.formatted}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {poll.totalVotes} votes
            </span>
          </div>

          {isEnded && winningOption ? (
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-amber-600/60 tracking-widest">Gagnant</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 truncate">{winningOption.text}</p>
              </div>
              <span className="text-xs font-black text-amber-600">{winningOption.percentage}%</span>
            </div>
          ) : !isEnded && optionsWithStats.length > 0 ? (
            <div className="space-y-3 pt-2">
              {optionsWithStats.slice(0, 2).map((opt) => (
                <div key={opt.index} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground/70">
                    <span className="truncate pr-4">{opt.text}</span>
                    <span>{opt.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${opt.percentage}%`,
                        background: "linear-gradient(90deg, var(--primary), #8b5cf6)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="h-[4.5rem]" />}
        </div>

        <div className="mt-6 pt-4 border-t border-border/40">
          <Link
            href={`/dashboard/my-polls/${poll.id}/stats`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-black transition-all hover:bg-primary/5 text-primary group-hover:gap-3"
          >
            Analyse des résultats
            <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyPollsPage() {
  const { myPolls, fetchMyPolls, isLoading } = usePollStore()
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)

  useEffect(() => {
    fetchMyPolls()
  }, [])

  const filteredPolls = myPolls.filter((poll) => {
    const isEnded = poll.status === "ended" || new Date(poll.endTime) <= new Date()
    if (filter === "all") return true
    if (filter === "active") return !isEnded && poll.status === "active"
    if (filter === "ended") return isEnded || poll.status === "ended"
    return true
  })

  const totalVotesCount = myPolls.reduce((acc, curr) => acc + (curr.totalVotes || 0), 0)
  const activePollsCount = myPolls.filter((p) => p.status === "active" && new Date(p.endTime) > new Date()).length
  const endedPollsCount = myPolls.filter((p) => p.status === "ended" || new Date(p.endTime) <= new Date()).length

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in duration-700">
      {/* Header Statistique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Sondages Créés", value: myPolls.length, icon: Vote, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "En Cours", value: activePollsCount, icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Engagement Total", value: totalVotesCount, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/50 shadow-lg flex items-center gap-5">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("h-7 w-7", stat.color)} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Unified Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2 rounded-[2.5rem] bg-muted/20 border border-border/40">
        <div className="flex items-center gap-6 pl-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl hover:bg-background/80">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Mes Sondages</h1>
          </div>

          <div className="hidden h-8 w-px bg-border/50 md:block" />

          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-auto">
            <TabsList className="bg-transparent gap-1">
              {[
                { value: "all", label: "Tous", count: myPolls.length },
                { value: "active", label: "Actifs", count: activePollsCount },
                { value: "ended", label: "Terminés", count: endedPollsCount }
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="rounded-full px-5 py-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-xs"
                >
                  {t.label} <span className="ml-1.5 opacity-40 font-black">{t.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-3 px-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full h-12 px-8 font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau Sondage
          </Button>
          <Button
            onClick={() => setIsVoteModalOpen(true)}
            variant="outline"
            className="rounded-full h-12 px-8 font-black border-primary/20 text-primary hover:bg-primary/5 transition-all hover:scale-105"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Nouveau Vote
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-[20rem] animate-pulse rounded-[2rem] bg-muted/40" />
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="text-center py-24 rounded-[3rem] border-4 border-dashed border-muted/50 bg-card/10">
          <div className="bg-muted/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Vote className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-2xl font-black mb-2">
            {filter === "all" ? "Vous n'avez pas de sondage" : `Aucun sondage ${filter === "active" ? "actif" : "terminé"}`}
          </h3>
          <p className="text-muted-foreground max-w-xs mx-auto font-medium mb-10">
            {filter === "all" ? "Changez les choses en posant votre première question aujourd'hui !" : "Ajustez vos filtres pour voir d'autres résultats."}
          </p>
          {filter === "all" && (
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-full h-14 px-10 font-black shadow-xl transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
              >
                <Plus className="h-6 w-6 mr-2" />
                Lancer un sondage
              </Button>
              <Button
                onClick={() => setIsVoteModalOpen(true)}
                variant="outline"
                className="rounded-full h-14 px-10 font-black border-primary/20 text-primary hover:bg-primary/5 transition-all hover:scale-105"
              >
                <CheckCircle2 className="h-6 w-6 mr-2" />
                Lancer un vote
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredPolls.map((poll) => (
            <PollMiniCard key={poll.id} poll={poll} onDelete={() => fetchMyPolls()} />
          ))}
        </div>
      )}

      <CreatePollModal mode="poll" open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={() => fetchMyPolls()} />
      <CreatePollModal mode="vote" open={isVoteModalOpen} onOpenChange={setIsVoteModalOpen} onSuccess={() => fetchMyPolls()} />
    </div>
  )
}
