"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { usePollStore, type Poll } from "@/store/poll-store"
import { PollCard } from "@/components/polls/poll-card"
import { ArrowLeft, Loader2, Vote, HelpCircle } from "lucide-react"

export default function HistoryPage() {
  const { votesHistory, pollsHistory, fetchEnhancedHistory, isLoading } = usePollStore()
  const [activeTab, setActiveTab] = useState("votes")

  useEffect(() => {
    fetchEnhancedHistory()
  }, [])

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
          <h1 className="text-2xl font-bold">Historique de Participation</h1>
          <p className="text-muted-foreground text-sm">Vos votes et sondages auxquels vous avez participé</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="votes" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Mes Votes ({votesHistory.length})
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Mes Sondages ({pollsHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Mes Votes Tab */}
        <TabsContent value="votes" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : votesHistory.length === 0 ? (
            <div className="text-center py-12">
              <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun vote</h3>
              <p className="text-muted-foreground mb-4">Vous n'avez pas encore participé à des votes.</p>
              <Button asChild>
                <Link href="/dashboard/groups">Rejoindre un groupe</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {votesHistory.map((poll: Poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mes Sondages Tab */}
        <TabsContent value="polls" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : pollsHistory.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun sondage</h3>
              <p className="text-muted-foreground mb-4">Vous n'avez pas encore participé à des sondages.</p>
              <Button asChild>
                <Link href="/dashboard">Découvrir les sondages</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pollsHistory.map((poll: Poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
