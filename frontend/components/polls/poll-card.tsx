"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { useCountdown } from "@/hooks/use-countdown"
import { pollsApi } from "@/lib/api"
import type { Poll } from "@/store/poll-store"
import { cn } from "@/lib/utils"
import { Clock, Users, MoreHorizontal, Share2, Flag, Check, Trophy } from "lucide-react"

interface PollCardProps {
  poll: Poll
  onVote?: () => void
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const { isAuthenticated } = useAuthStore()
  const [isVoting, setIsVoting] = useState(false)
  const [localPoll, setLocalPoll] = useState(poll)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const countdown = useCountdown(poll.endTime)

  const isEnded = poll.status === "ended" || countdown.isExpired
  const canVote = !isEnded && !poll.hasVoted && !poll.isCreator
  const showResults = poll.hasVoted || isEnded || poll.isCreator

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

    if (!canVote) return

    setIsVoting(true)
    try {
      const updatedPoll = await pollsApi.vote(poll.id, optionIndex)
      setLocalPoll(updatedPoll)
      toast.success("Vote enregistré avec succès !")
      onVote?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du vote")
    } finally {
      setIsVoting(false)
    }
  }

  const getWinningOption = () => {
    if (!isEnded) return null
    return localPoll.options.reduce((prev, current) => (prev.votes > current.votes ? prev : current))
  }

  const winningOption = getWinningOption()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={poll.createdBy.avatarUrl || "/placeholder.svg"} alt={poll.createdBy.username} />
              <AvatarFallback style={{ background: "var(--primary)", color: "white" }}>
                {poll.createdBy.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">@{poll.createdBy.username}</p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(poll.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {poll.isCreator && (
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
          {localPoll.options.map((option) => {
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
                  isMyVote && "border-[var(--primary)]",
                  isWinner && "border-green-500 bg-green-50 dark:bg-green-950/20",
                  !isMyVote && !isWinner && "border-border",
                )}
              >
                {/* Progress bar background */}
                {showResults && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      isMyVote ? "bg-[var(--primary-100)]" : "bg-muted",
                    )}
                    style={{ width: `${option.percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!showResults && <div className={cn("h-4 w-4 rounded-full border-2", "border-muted-foreground")} />}
                    {isWinner && <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />}
                    {isMyVote && <Check className="h-4 w-4" style={{ color: "var(--primary)" }} />}
                    <span className="font-medium text-foreground">{option.text}</span>
                  </div>
                  {showResults && <span className="font-bold text-sm text-foreground">{option.percentage}%</span>}
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
