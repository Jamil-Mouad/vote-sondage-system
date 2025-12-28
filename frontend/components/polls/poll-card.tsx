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
import { useSocket } from "@/components/providers/socket-provider"
import { toast } from "sonner"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"
import { Clock, Users, MoreHorizontal, Share2, Flag, Check, Trophy, Lock, MessageCircle } from "lucide-react"

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

  const { socket } = useSocket()

  // Sync state with props when poll changes (crucial for refresh/store updates)
  useEffect(() => {
    setLocalPoll(poll)
  }, [poll])

  // Join poll room for real-time updates
  useEffect(() => {
    if (socket) {
      socket.emit("join:poll", poll.id)
      return () => {
        socket.emit("leave:poll", poll.id)
      }
    }
  }, [socket, poll.id])

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

    // Logique de fallback locale
    if (localPoll.pollType === 'vote') {
      return isEnded && (localPoll.hasVoted || isCreator)
    }

    if (localPoll.pollType === 'binary_poll' && !localPoll.isPublic) {
      return localPoll.hasVoted || isCreator || isEnded
    }

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
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (isCreator) {
      toast.info("Vous ne pouvez pas voter sur votre propre sondage")
      return
    }

    if (localPoll.hasVoted) {
      toast.warning("Vous avez déjà voté sur ce sondage")
      return
    }

    if (!canVote) return

    setIsVoting(true)
    try {
      const success = await vote(poll.id, optionIndex)
      if (success) {
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
      if (errorMessage.includes("creator") || errorMessage.includes("propre")) {
        toast.info("Vous ne pouvez pas voter sur votre propre sondage")
      } else if (errorMessage.includes("already voted") || errorMessage.includes("déjà voté") || errorMessage.includes("Conflict")) {
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

  const avatarUrl = poll.creatorAvatar
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${poll.creatorAvatar}`
    : undefined
  const creatorName = poll.creatorName || "Utilisateur"

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 border-white/10 shadow-lg hover:shadow-2xl hover:translate-y-[-2px] bg-white/50 backdrop-blur-md dark:bg-[#1E1E1E]/90 dark:border-white/5">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-purple-500">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={avatarUrl} alt={creatorName} />
                <AvatarFallback className="bg-background text-foreground font-bold">
                  {creatorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground/90">{creatorName}</p>
              <p className="text-xs text-muted-foreground font-medium">{formatTimeAgo(poll.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PollTypeBadge type={poll.pollType} className="text-[10px] px-2 py-0.5 shadow-sm" />
            {isCreator && (
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">
                Moi
              </Badge>
            )}
            {isEnded && (
              <Badge variant="destructive" className="text-[10px]">
                Terminé
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem className="cursor-pointer">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Question */}
        <div className="px-5 py-4">
          <h3 className="font-black text-2xl leading-tight mb-2 text-foreground tracking-tight">{poll.question}</h3>
          {poll.description && <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">{poll.description}</p>}
        </div>

        {/* 3D-like Metadata Indicators */}
        {!isEnded && (
          <div className="px-5 pb-2 flex gap-4">
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20 shadow-sm">
              <div className="relative">
                <Clock className="h-4 w-4 text-blue-500 drop-shadow-sm" />
                {countdown.minutes < 60 && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
              </div>
              <span className="text-xs font-semibold">{countdown.formatted}</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-xl border border-purple-500/20 shadow-sm">
              <MessageCircle className="h-4 w-4 text-purple-500 drop-shadow-sm" />
              <span className="text-xs font-semibold">{localPoll.totalVotes} votes</span>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="px-5 pb-5 space-y-3 pt-2">
          {!showResults && localPoll.hasVoted && localPoll.pollType === 'vote' && !isEnded && (
            <div className="p-4 text-center rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm mb-3">
              <Lock className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                Résultats masqués
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">
                Le suspense reste entier jusqu'à la fin !
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
                  "w-full relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-300 group/option",
                  // Interaction Styles
                  canVote && "hover:border-primary/30 hover:bg-primary/5 cursor-pointer active:scale-[0.99]",
                  !canVote && "cursor-default",
                  // Selected Styles
                  isMyVote ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" : "border-border/60 bg-card/40",
                  // Winner Styles
                  isWinner && !isMyVote && "border-amber-500/50 bg-amber-500/5",
                )}
              >
                {/* Gradient Progress Bar */}
                {showResults && (
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-r-full opacity-15 dark:opacity-25",
                    )}
                    style={{
                      width: `${option.percentage}%`,
                      background: `linear-gradient(90deg, var(--primary) 0%, #8b5cf6 100%)`,
                      height: '100%'
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    {/* Checkbox / Indicator */}
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm shrink-0",
                      isMyVote
                        ? "bg-primary border-primary scale-110 shadow-primary/30"
                        : "border-muted-foreground/30 group-hover/option:border-primary/60",
                      showResults && !isMyVote && "opacity-50"
                    )}>
                      {isMyVote ? (
                        <Check className="h-4 w-4 text-white stroke-[3.5]" />
                      ) : !showResults && (
                        <div className="h-2 w-2 rounded-full bg-primary opacity-0 group-hover/option:opacity-100 transition-opacity" />
                      )}
                      {showResults && !isMyVote && <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                    </div>

                    <span className={cn(
                      "font-bold transition-colors duration-300 text-base tracking-tight",
                      isMyVote ? "text-primary" : "text-foreground/90",
                      isWinner && !isMyVote && "text-amber-600 dark:text-amber-400"
                    )}>
                      {option.text}
                      {isWinner && !isMyVote && <Trophy className="inline-block h-4 w-4 ml-2 text-amber-500 drop-shadow-sm" />}
                    </span>
                  </div>

                  {showResults && (
                    <div className="flex flex-col items-end shrink-0">
                      <span className={cn(
                        "font-black text-lg tabular-nums tracking-tighter",
                        isMyVote ? "text-primary" : "text-foreground/70"
                      )}>
                        {option.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        {isEnded && (
          <div className="px-5 py-3 bg-muted/20 border-t border-white/5 flex items-center justify-center">
            <p className="text-xs font-medium text-muted-foreground">
              Ce sondage est clôturé. <span className="text-foreground">Merci d'avoir participé !</span>
            </p>
          </div>
        )}
      </CardContent>

      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Card >
  )
}
