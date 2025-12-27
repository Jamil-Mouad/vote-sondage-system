"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"
import { PollTypeBadge } from "@/components/polls/poll-type-badge"
import { useAuthStore } from "@/store/auth-store"
import { usePollStore, type Poll, type PollOption } from "@/store/poll-store"
import { toast } from "sonner"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"
import { Clock, Users, MoreHorizontal, Share2, Flag, Check, Trophy, Lock } from "lucide-react"

interface PollCardProps {
  poll: Poll
  onVote?: () => void
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const { isAuthenticated, user } = useAuthStore()
  const { vote } = usePollStore()
  const [isVoting, setIsVoting] = useState(false)
  const [localPoll, setLocalPoll] = useState(poll)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const countdown = useCountdown(poll.endTime)

  // Sync state with props when poll changes (crucial for refresh/store updates)
  useEffect(() => {
    setLocalPoll(poll)
  }, [poll])

  const isEnded = poll.status === "ended" || countdown.isExpired
  const isCreator = user?.id !== undefined && Number(user.id) === poll.createdBy
  const canVote = !isEnded && !localPoll.hasVoted && !isCreator

  // Parse results for display
  const optionsWithStats = localPoll.options.map((option) => {
    const result = localPoll.results?.results?.find(r => r.text === option.text)
    return {
      ...option,
      votes: result?.votes || option.votes || 0,
      percentage: result?.percentage || option.percentage || 0,
    }
  })

  // Utiliser canSeeResults du backend si disponible, sinon calculer localement
  const canSeeResults = () => {
    if (localPoll.canSeeResults !== undefined) {
      return localPoll.canSeeResults
    }

    // Logique de fallback locale (similaire au backend)
    if (localPoll.pollType === 'vote') {
      // Vote: résultats uniquement après la fin ET si l'utilisateur a voté
      return isEnded && (localPoll.hasVoted || isCreator)
    }

    if (localPoll.pollType === 'binary_poll' && !localPoll.isPublic) {
      // Binary poll privé: temps réel pour les votants
      return localPoll.hasVoted || isCreator || isEnded
    }

    // Sondage standard: afficher si voté ou terminé
    return localPoll.showResultsOnVote && (localPoll.hasVoted || isCreator || isEnded)
  }

  const showResults = canSeeResults()

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return `Il y a ${diffDays}j`
  }

  const handleVote = async (optionIndex: number) => {
    // Si non authentifié, afficher la modal de connexion
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    // Si c'est le créateur, afficher un toast d'info
    if (isCreator) {
      toast.info("Vous ne pouvez pas voter sur votre propre sondage")
      return
    }

    // Si déjà voté, afficher un toast
    if (localPoll.hasVoted) {
      toast.warning("Vous avez déjà voté sur ce sondage")
      return
    }

    if (!canVote) return

    setIsVoting(true)
    try {
      const success = await vote(poll.id, optionIndex)
      if (success) {
        // Calculate new results locally
        const newTotalVotes = localPoll.totalVotes + 1
        const newResults: PollOption[] = localPoll.options.map((option) => {
          const currentResult = localPoll.results?.results?.find(r => r.text === option.text)
          const currentVotes = currentResult?.votes || 0
          const newVotes = option.index === optionIndex ? currentVotes + 1 : currentVotes
          return {
            index: option.index,
            text: option.text,
            votes: newVotes,
            percentage: newTotalVotes > 0 ? parseFloat(((newVotes / newTotalVotes) * 100).toFixed(2)) : 0
          }
        })

        // Update local state with new results
        setLocalPoll(prev => ({
          ...prev,
          hasVoted: true,
          myVote: optionIndex,
          totalVotes: newTotalVotes,
          results: {
            totalVotes: newTotalVotes,
            results: newResults
          }
        }))
        toast.success("Vote enregistré avec succès !")
        onVote?.()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du vote"
      // Afficher un toast approprié selon l'erreur
      if (errorMessage.includes("creator") || errorMessage.includes("propre")) {
        toast.info("Vous ne pouvez pas voter sur votre propre sondage")
      } else if (errorMessage.includes("already voted") || errorMessage.includes("déjà voté") || errorMessage.includes("Conflict")) {
        // Update local state to reflect that user has already voted
        setLocalPoll(prev => ({ ...prev, hasVoted: true }))
        toast.warning("Vous avez déjà voté sur ce sondage")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsVoting(false)
    }
  }

  const getWinningOption = () => {
    if (!isEnded || optionsWithStats.length === 0) return null
    return optionsWithStats.reduce((prev, current) => (prev.votes > current.votes ? prev : current))
  }

  const winningOption = getWinningOption()

  // Build avatar URL
  const avatarUrl = poll.creatorAvatar
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${poll.creatorAvatar}`
    : undefined
  const creatorName = poll.creatorName || "Utilisateur"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={creatorName} />
              <AvatarFallback style={{ background: "var(--primary)", color: "white" }}>
                {creatorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{creatorName}</p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(poll.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PollTypeBadge type={poll.pollType} className="text-xs" />
            {isCreator && (
              <Badge variant="secondary" className="text-xs">
                Créateur
              </Badge>
            )}
            {isEnded && (
              <Badge variant="destructive" className="text-xs">
                Terminé
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 py-3">
          <h3 className="font-semibold text-lg leading-tight mb-1">{poll.question}</h3>
          {poll.description && <p className="text-sm text-muted-foreground">{poll.description}</p>}
        </div>

        {/* Timer */}
        {!isEnded && (
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm",
              countdown.minutes < 2 ? "text-red-500" : "text-muted-foreground",
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Termine dans {countdown.formatted}</span>
          </div>
        )}

        {/* Options */}
        <div className="px-4 pb-4 space-y-2">
          {!showResults && localPoll.hasVoted && localPoll.pollType === 'vote' && !isEnded && (
            <div className="p-4 text-center rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 mb-3">
              <Lock className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Résultats masqués jusqu'à la fin du vote
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">
                Seuls les participants pourront voir les résultats une fois le vote terminé
              </p>
            </div>
          )}
          {optionsWithStats.map((option) => {
            const isMyVote = localPoll.myVote !== null && Number(localPoll.myVote) === Number(option.index)
            const isWinner = isEnded && winningOption?.index === option.index

            return (
              <button
                key={option.index}
                onClick={() => handleVote(option.index)}
                disabled={!canVote || isVoting}
                className={cn(
                  "w-full relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all duration-300",
                  canVote && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer active:scale-[0.98]",
                  !canVote && "cursor-default",
                  isMyVote ? "border-green-500 bg-green-500/10 shadow-md ring-1 ring-green-500/20" : "border-border",
                  isWinner && !isMyVote && "border-amber-500/50 bg-amber-500/5",
                )}
              >
                {/* Progress bar background */}
                {showResults && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-700 ease-in-out",
                      isMyVote
                        ? "bg-green-500/20 dark:bg-green-500/15"
                        : "bg-muted/30"
                    )}
                    style={{ width: `${option.percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Visual indicator of selection */}
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      isMyVote
                        ? "bg-green-500 border-green-500 scale-110 shadow-sm"
                        : "border-muted-foreground/30",
                      showResults && !isMyVote && "opacity-50"
                    )}>
                      {isMyVote ? (
                        <Check className="h-3 w-3 text-white stroke-[3]" />
                      ) : !showResults && (
                        <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
                      )}
                    </div>

                    <span className={cn(
                      "font-semibold transition-colors duration-300",
                      isMyVote ? "text-green-700 dark:text-green-300" : "text-foreground/90",
                      isWinner && !isMyVote && "text-amber-700 dark:text-amber-400"
                    )}>
                      {option.text}
                      {isWinner && !isMyVote && <Trophy className="inline-block h-3.5 w-3.5 ml-2 text-amber-500 animate-bounce" />}
                    </span>
                  </div>

                  {showResults && (
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "font-bold text-sm tabular-nums",
                        isMyVote ? "text-green-600 dark:text-green-400" : "text-foreground/70"
                      )}>
                        {option.percentage}%
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-medium">
                        {option.votes} {option.votes > 1 ? 'votes' : 'vote'}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {localPoll.totalVotes} votes
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <Share2 className="h-3 w-3 mr-1" />
            Partager
          </Button>
        </div>
      </CardContent>

      {/* Modal de connexion requise */}
      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Card>
  )
}
