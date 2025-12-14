"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"
import { useAuthStore } from "@/store/auth-store"
import { usePollStore } from "@/store/poll-store"
import { toast } from "sonner"
import { useCountdown } from "@/hooks/use-countdown"
import type { Poll } from "@/store/poll-store"
import { cn } from "@/lib/utils"
import { Clock, Users, MoreHorizontal, Share2, Flag, Check, Trophy } from "lucide-react"

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
  const countdown = useCountdown(poll.end_time)

  const isEnded = poll.status === "ended" || countdown.isExpired
  const isCreator = user?.id !== undefined && Number(user.id) === poll.created_by
  const canVote = !isEnded && !localPoll.hasVoted && !isCreator

  // Parse results for display
  const optionsWithStats = localPoll.options.map((optionText, index) => {
    const result = localPoll.results?.results?.find(r => r.option === optionText)
    return {
      index: index + 1,
      text: optionText,
      votes: result?.votes || 0,
      percentage: result?.percentage || 0,
    }
  })

  const showResults = localPoll.hasVoted || isEnded || isCreator

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
        const newResults = localPoll.options.map((optionText, idx) => {
          const currentResult = localPoll.results?.results?.find(r => r.option === optionText)
          const currentVotes = currentResult?.votes || 0
          const newVotes = (idx + 1) === optionIndex ? currentVotes + 1 : currentVotes
          return {
            option: optionText,
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
              <p className="text-xs text-muted-foreground">{formatTimeAgo(poll.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          {optionsWithStats.map((option) => {
            const isMyVote = localPoll.myVote === option.index
            const isWinner = isEnded && winningOption?.index === option.index

            return (
              <button
                key={option.index}
                onClick={() => handleVote(option.index)}
                disabled={!canVote || isVoting}
                className={cn(
                  "w-full relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all",
                  canVote && "hover:border-[var(--primary)] hover:bg-[var(--primary-50)] cursor-pointer",
                  !canVote && "cursor-default",
                  isMyVote && "border-green-500 bg-green-100 dark:bg-green-900/50",
                  isWinner && !isMyVote && "border-amber-500 bg-amber-50 dark:bg-amber-950/20",
                  !isMyVote && !isWinner && "border-border",
                )}
              >
                {/* Progress bar background */}
                {showResults && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      isMyVote ? "bg-green-200 dark:bg-green-800/50" : "bg-muted/50",
                    )}
                    style={{ width: `${option.percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Show radio circle only if not voted and not showing results */}
                    {!showResults && !localPoll.hasVoted && (
                      <div className={cn("h-4 w-4 rounded-full border-2", "border-muted-foreground")} />
                    )}
                    {/* Show checkmark for voted option */}
                    {isMyVote && (
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {/* Show trophy for winner if not my vote */}
                    {isWinner && !isMyVote && <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                    <span className={cn(
                      "font-medium",
                      isMyVote ? "text-green-700 dark:text-green-300" : "text-foreground"
                    )}>
                      {option.text}
                    </span>
                  </div>
                  {showResults && (
                    <span className={cn(
                      "font-bold text-sm",
                      isMyVote ? "text-green-700 dark:text-green-300" : "text-foreground"
                    )}>
                      {option.percentage}%
                    </span>
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
