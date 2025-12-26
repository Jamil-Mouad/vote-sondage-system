"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PollCard } from "@/components/polls/poll-card"
import { CreatePollModal } from "@/components/polls/create-poll-modal"
import { PollCardSkeleton } from "@/components/polls/poll-card-skeleton"
import { usePollStore } from "@/store/poll-store"
import { Plus, Vote, Search, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const [isPollModalOpen, setIsPollModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { polls, fetchPublicPolls, isLoading: pollsLoading } = usePollStore()

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            Sondages Publics
          </h1>
          <p className="text-muted-foreground text-sm">Découvrez et participez aux sondages de la communauté</p>
        </div>

        <Button
          onClick={() => setIsPollModalOpen(true)}
          style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
          className="text-white shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un sondage
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un sondage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-card border-primary/10 transition-colors focus-visible:border-primary/30"
          />
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} className="hover:bg-primary/5">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {pollsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <PollCardSkeleton key={i} />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
            <Vote className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground/80">Aucun sondage disponible</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Soyez le premier de la communauté à lancer un débat !</p>
            <Button
              onClick={() => setIsPollModalOpen(true)}
              style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
              className="px-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un sondage
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} onVote={() => fetchPublicPolls({ status: "active" })} />
            ))}
          </div>
        )}
      </div>

      <CreatePollModal open={isPollModalOpen} onOpenChange={setIsPollModalOpen} onSuccess={() => fetchPublicPolls({ status: "active" })} />
    </div>
  )
}
