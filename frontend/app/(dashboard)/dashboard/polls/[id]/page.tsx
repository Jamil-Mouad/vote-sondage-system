"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { usePollStore, type Poll } from "@/store/poll-store"
import { pollsApi } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Clock, Users, CheckCircle, Loader2, Share2, BarChart3, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/use-countdown"

export default function PollVotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { currentPoll: poll, fetchPollById, vote, isLoading } = usePollStore()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const countdown = useCountdown(poll?.endTime || new Date())

  useEffect(() => {
    if (resolvedParams.id) {
      loadPoll()
    }
  }, [resolvedParams.id])

  const loadPoll = async () => {
    try {
      const pollId = Number.parseInt(resolvedParams.id)
      const data = await fetchPollById(pollId)
      if (!data) {
        toast.error("Sondage non trouvé")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("Erreur lors du chargement du sondage")
      router.push("/dashboard")
    }
  }

  if (isLoading && !poll) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Sondage non trouvé</h2>
        <Button variant="link" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  const isEnded = poll.status === "ended" || countdown.isExpired
  const canVote = !isEnded && !poll.hasVoted && !poll.isCreator
  const showResults = poll.hasVoted || isEnded || poll.isCreator

  const handleVote = async () => {
    if (selectedOption === null) return

    setIsVoting(true)
    try {
      await vote(poll.id, selectedOption)
      toast.success("Vote enregistré avec succès!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du vote")
    } finally {
      setIsVoting(false)
    }
  }

  const getWinningOption = () => {
    if (!isEnded) return null
    return poll.options.reduce((prev, current) => (prev.votes > current.votes ? prev : current))
  }

  const winningOption = getWinningOption()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={poll.creatorAvatar || "/placeholder.svg?height=40&width=40&query=avatar"} />
                <AvatarFallback>{poll.creatorName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">@{poll.creatorName || "Utilisateur"}</p>
                <p className="text-sm text-muted-foreground">
                  Créé le {new Date(poll.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {poll.isCreator && <Badge variant="secondary">Créateur</Badge>}
              <Badge variant={isEnded ? "secondary" : "default"}>{isEnded ? "Terminé" : "Actif"}</Badge>
            </div>
          </div>
          <CardTitle className="mt-4 text-xl">{poll.question}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {countdown.formatted}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!showResults ? (
            <>
              <RadioGroup
                value={selectedOption?.toString() || ""}
                onValueChange={(val) => setSelectedOption(Number.parseInt(val))}
                className="space-y-3"
              >
                {poll.options.map((option) => (
                  <div
                    key={option.index}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-4 transition-colors cursor-pointer",
                      selectedOption === option.index ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                    onClick={() => setSelectedOption(option.index)}
                  >
                    <RadioGroupItem value={option.index.toString()} id={`option-${option.index}`} />
                    <Label htmlFor={`option-${option.index}`} className="flex-1 cursor-pointer font-medium">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button onClick={handleVote} disabled={selectedOption === null || isVoting} className="w-full" size="lg">
                {isVoting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi du vote...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Voter
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {poll.options.map((option) => {
                  const isMyVote = poll.myVote === option.index
                  const isWinner = isEnded && winningOption?.index === option.index

                  return (
                    <div key={option.index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isWinner && poll.totalVotes > 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                          {isMyVote && <CheckCircle className="h-4 w-4 text-primary" />}
                          <span className="font-medium">{option.text}</span>
                          {isWinner && poll.totalVotes > 0 && (
                            <Badge variant="default" className="text-xs">
                              Gagnant
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {option.votes} vote{option.votes !== 1 ? "s" : ""} ({option.percentage}%)
                        </span>
                      </div>
                      <Progress value={option.percentage} className={cn("h-3", isMyVote && "[&>div]:bg-primary")} />
                    </div>
                  )
                })}
              </div>

              {poll.hasVoted && (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>Votre vote a été enregistré avec succès!</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
                {poll.isCreator && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => router.push(`/dashboard/my-polls/${poll.id}/stats`)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Statistiques
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
