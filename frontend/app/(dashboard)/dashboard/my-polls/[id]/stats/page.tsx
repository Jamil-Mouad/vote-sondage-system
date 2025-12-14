"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePollStore, type PollStats } from "@/store/poll-store"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"
import { ArrowLeft, Users, Target, TrendingUp, Calendar, Clock, Loader2, BarChart2 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

const COLORS = ["var(--primary)", "#10B981", "#F59E0B", "#EF4444"]
const DEFAULT_DATE = "2099-12-31T23:59:59.000Z" // Far future date as default

export default function PollStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { fetchPollStats, isLoading } = usePollStore()
  const [stats, setStats] = useState<PollStats | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchPollStats(Number.parseInt(id))
      if (data) {
        setStats(data)
      }
    }
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const countdown = useCountdown(stats?.poll?.endTime || DEFAULT_DATE)
  const isEnded = stats?.poll?.status === "ended" || countdown.isExpired

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Sondage non trouvé ou accès refusé</h3>
        <p className="text-muted-foreground mb-4">Seul le créateur peut voir les statistiques.</p>
        <Button asChild>
          <Link href="/dashboard/my-polls">Retour à mes sondages</Link>
        </Button>
      </div>
    )
  }

  const pieData = stats.optionStats.map((opt) => ({
    name: opt.option,
    value: opt.votes,
  }))

  const barData = stats.optionStats.map((opt) => ({
    name: opt.option,
    votes: opt.votes,
    percentage: opt.percentage,
  }))

  // Format daily votes data from API
  const dailyVotesData = stats.votesOverTime.map(item => ({
    date: new Date(item.date).toLocaleDateString("fr-FR", { weekday: "short" }),
    votes: item.count,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/my-polls">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">Statistiques du Sondage</h1>
        </div>
      </div>

      {/* Poll Info Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="h-5 w-5" style={{ color: "var(--primary)" }} />
            <h2 className="text-lg font-semibold">{stats.poll.question}</h2>
          </div>
          {stats.poll.description && (
            <p className="text-muted-foreground mb-3">{stats.poll.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={isEnded ? "destructive" : "default"} className={!isEnded ? "bg-green-500" : ""}>
              {isEnded ? "Terminé" : "Actif"}
            </Badge>
            {!isEnded ? (
              <span className={cn("flex items-center gap-1", countdown.minutes < 30 && "text-orange-500")}>
                <Clock className="h-4 w-4" />
                {countdown.formatted} restants
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Terminé
              </span>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Créé le {new Date(stats.poll.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: "var(--primary-100)" }}>
              <Users className="h-6 w-6" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalVotes}</p>
              <p className="text-sm text-muted-foreground">Votes totaux</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/30">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.optionStats.length}</p>
              <p className="text-sm text-muted-foreground">Options</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/30">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.participationRate}%</p>
              <p className="text-sm text-muted-foreground">Participation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition des Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {stats.optionStats.map((opt, index) => (
                <div key={opt.optionIndex} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                  <span className="text-sm truncate">{opt.option}</span>
                  <span className="text-sm font-bold ml-auto">{opt.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Votes par Option</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="votes" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Votes Over Time */}
      {dailyVotesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Votes par Jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyVotesData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="votes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résultats Détaillés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Option</th>
                  <th className="text-right py-3 px-4">Votes</th>
                  <th className="text-right py-3 px-4">Pourcentage</th>
                  <th className="py-3 px-4">Barre</th>
                </tr>
              </thead>
              <tbody>
                {stats.optionStats.map((opt, index) => (
                  <tr key={opt.optionIndex} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                        {opt.option}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">{opt.votes}</td>
                    <td className="text-right py-3 px-4 font-bold">{opt.percentage}%</td>
                    <td className="py-3 px-4 w-48">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${opt.percentage}%`,
                            background: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Voters List */}
      {Object.keys(stats.votersByOption).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liste des Votants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.optionStats.map((opt, index) => {
                const voters = stats.votersByOption[opt.optionIndex] || []
                if (voters.length === 0) return null
                
                return (
                  <div key={opt.optionIndex}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                      <h4 className="font-medium">{opt.option}</h4>
                      <Badge variant="secondary" className="ml-auto">{voters.length} votes</Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {voters.map((voter) => (
                        <div key={voter.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={voter.avatar ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${voter.avatar}` : undefined} 
                              alt={voter.name} 
                            />
                            <AvatarFallback className="text-xs">
                              {voter.name?.slice(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{voter.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(voter.votedAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
