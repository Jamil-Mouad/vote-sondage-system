"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PollCard } from "@/components/polls/poll-card"
import { GroupCard } from "@/components/groups/group-card"
import { CreatePollModal } from "@/components/polls/create-poll-modal"
import { CreateGroupModal } from "@/components/groups/create-group-modal"
import { PollCardSkeleton } from "@/components/polls/poll-card-skeleton"
import { usePollStore } from "@/store/poll-store"
import { useGroupStore } from "@/store/group-store"
import { Plus, Vote, Users, Search, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("polls")
  const [isPollModalOpen, setIsPollModalOpen] = useState(false)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { polls, fetchPublicPolls, isLoading: pollsLoading } = usePollStore()
  const { groups, setGroups, isLoading: groupsLoading, setLoading: setGroupsLoading } = useGroupStore()

  useEffect(() => {
    fetchPublicPolls({ status: "active" })
    loadGroups()
  }, [])

  const handleSearch = () => {
    fetchPublicPolls({ status: "active", search: searchQuery })
  }

  const handleRefresh = () => {
    setSearchQuery("")
    fetchPublicPolls({ status: "active" })
  }

  const loadGroups = async () => {
    setGroupsLoading(true)
    try {
      // TODO: Implement when groups are dynamic
      setGroups([])
    } catch (error) {
      console.error("Error loading groups:", error)
    } finally {
      setGroupsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="polls" className="gap-2">
              <Vote className="h-4 w-4" />
              <span className="hidden sm:inline">Sondages Publics</span>
              <span className="sm:hidden">Sondages</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="h-4 w-4" />
              Groupes
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => (activeTab === "polls" ? setIsPollModalOpen(true) : setIsGroupModalOpen(true))}
            style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
            className="text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "polls" ? "Créer un sondage" : "Créer un groupe"}
          </Button>
        </div>

        <TabsContent value="polls" className="space-y-4 mt-0">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un sondage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {pollsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <PollCardSkeleton key={i} />
              ))}
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12">
              <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun sondage disponible</h3>
              <p className="text-muted-foreground mb-4">Soyez le premier à créer un sondage !</p>
              <Button
                onClick={() => setIsPollModalOpen(true)}
                style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
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
        </TabsContent>

        <TabsContent value="groups" className="mt-0">
          {groupsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun groupe disponible</h3>
              <p className="text-muted-foreground mb-4">Créez un groupe pour organiser des sondages privés !</p>
              <Button
                onClick={() => setIsGroupModalOpen(true)}
                style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un groupe
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} onUpdate={loadGroups} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreatePollModal open={isPollModalOpen} onOpenChange={setIsPollModalOpen} onSuccess={() => fetchPublicPolls({ status: "active" })} />

      <CreateGroupModal open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen} onSuccess={loadGroups} />
    </div>
  )
}
