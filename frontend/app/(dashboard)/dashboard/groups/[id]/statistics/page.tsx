"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PollTypeBadge } from "@/components/polls/poll-type-badge"
import { useGroupStore } from "@/store/group-store"
import { ArrowLeft, Users, Loader2, Clock, Trophy, Calendar } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function GroupStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = parseInt(resolvedParams.id)
  const router = useRouter()
  const { currentGroup, currentStatistics, fetchGroupById, fetchGroupStatistics, isLoading } = useGroupStore()

  useEffect(() => {
    const loadData = async () => {
      await fetchGroupById(groupId)
      await fetchGroupStatistics(groupId)
    }
    loadData()
  }, [groupId])

  const group = currentGroup
  const stats = currentStatistics

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Chargement des statistiques...</p>
      </div>
    )
  }

  if (!group || group.id !== groupId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Groupe non trouvé</h2>
          <p className="text-muted-foreground mt-1">Ce groupe n'existe pas ou vous n'y avez pas accès.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/groups">Retour aux groupes</Link>
        </Button>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <h2 className="text-2xl font-bold">Statistiques non disponibles</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Statistiques du groupe</h1>
          <p className="text-muted-foreground text-sm">{group.name}</p>
        </div>
      </div>

      {/* Group Summary */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{group.name}</CardTitle>
              <CardDescription>Vue d'ensemble de la participation</CardDescription>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <Users className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Membres</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <Trophy className="h-5 w-5 text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{stats.polls.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sondages/Votes</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <Clock className="h-5 w-5 text-green-500 mb-2" />
              <p className="text-2xl font-bold">
                {stats.polls.filter(p => p.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Polls Statistics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Participation par sondage</h2>
        {stats.polls.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold">Aucun sondage</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Créez votre premier sondage pour voir les statistiques.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {stats.polls.map((poll) => (
              <Card key={poll.pollId} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PollTypeBadge type={poll.pollType} />
                        <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                          {poll.status === 'active' ? 'Actif' : poll.status === 'ended' ? 'Terminé' : 'Annulé'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{poll.question}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Fin: {new Date(poll.endTime).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    <div className="relative h-24 w-24">
                      {/* Circular Progress */}
                      <svg className="transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-muted/30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-primary"
                          strokeDasharray={`${poll.participationRate * 2.51} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-xl font-bold">{poll.participationRate}%</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Participation</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vote Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Votes</p>
                      <p className="text-2xl font-bold">{poll.totalVotes}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Membres</p>
                      <p className="text-2xl font-bold">{poll.totalMembers}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">Taux</p>
                      <p className="text-2xl font-bold">{poll.participationRate}%</p>
                    </div>
                  </div>

                  {/* Participation Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{poll.totalVotes} / {poll.totalMembers}</span>
                    </div>
                    <Progress value={poll.participationRate} className="h-3" />
                  </div>

                  {/* Top 5 Earliest Voters */}
                  {poll.topVoters.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Top 5 premiers votants
                      </h4>
                      <div className="space-y-2">
                        {poll.topVoters.map((voter, index) => (
                          <div
                            key={voter.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                          >
                            <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-amber-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-orange-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {voter.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{voter.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{voter.email}</p>
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                              {new Date(voter.votedAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
