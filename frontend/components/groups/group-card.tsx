"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useGroupStore, type Group } from "@/store/group-store"
import { Users, BarChart2, Clock, Check, Crown, Loader2, Globe, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface GroupCardProps {
  group: Group
  onUpdate?: () => void
}

export function GroupCard({ group, onUpdate }: GroupCardProps) {
  const { requestToJoin } = useGroupStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleJoin = async () => {
    setIsLoading(true)
    try {
      const success = await requestToJoin(group.id)
      if (success) {
        toast.success("Demande d'adhésion envoyée !")
        onUpdate?.()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la demande")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusButton = () => {
    switch (group.membershipStatus) {
      case "approved":
        return (
          <Button
            variant="ghost"
            className="w-full text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-full h-11 font-semibold"
            asChild
          >
            <Link href={`/dashboard/groups/${group.id}`}>
              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                Accéder au groupe
              </span>
            </Link>
          </Button>
        )
      case "pending":
        return (
          <Button variant="ghost" className="w-full text-muted-foreground bg-muted/30 cursor-not-allowed rounded-full h-11" disabled>
            <Clock className="h-4 w-4 mr-2" />
            En attente
          </Button>
        )
      default:
        return (
          <Button
            className="w-full rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300 h-11 font-bold active:scale-95"
            style={{
              background: "var(--primary)",
              color: "white"
            }}
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
            Rejoindre
          </Button>
        )
    }
  }

  return (
    <Card className="overflow-hidden bg-card hover:shadow-2xl transition-all duration-300 group/card ring-1 ring-border/50 hover:ring-primary/20 hover:translate-y-[-4px] p-0 rounded-[2rem] relative">
      {/* Invisible link overlay for the whole card when approved */}
      {group.membershipStatus === "approved" && (
        <Link
          href={`/dashboard/groups/${group.id}`}
          className="absolute inset-0 z-20"
          aria-label={`Accéder au groupe ${group.name}`}
        />
      )}

      <CardContent className="p-0 flex flex-col h-full">
        {/* Header with gradient */}
        <div
          className="h-32 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--primary), var(--primary-700))`,
          }}
        >
          {/* Abstract pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent transition-opacity group-hover/card:opacity-30" />

          {group.myRole === "admin" && (
            <Badge className="absolute top-4 right-4 bg-amber-400 text-amber-950 font-bold border-amber-400/50 shadow-sm z-30 rounded-full px-3">
              <Crown className="h-3 w-3 mr-1 fill-amber-950" />
              Admin
            </Badge>
          )}
          <Badge variant="outline" className="absolute top-4 left-4 bg-black/20 text-white border-white/20 backdrop-blur-md rounded-full px-3 z-30">
            {group.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
            {group.isPublic ? "Public" : "Privé"}
          </Badge>

          {/* Initials Avatar centered overlapping */}
          <div className="absolute -bottom-6 left-8 w-14 h-14 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-primary font-bold text-2xl z-30 transition-transform group-hover/card:scale-110 group-hover/card:rotate-3">
            {group.name.substring(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="pt-10 px-8 pb-8 flex-1 flex flex-col">
          <div className="mb-5">
            <h3 className="font-bold text-2xl leading-tight line-clamp-1 group-hover/card:text-primary transition-colors tracking-tight">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-3 leading-relaxed h-[3em]">{group.description}</p>
            )}
            {!group.description && <div className="h-[3em]" />}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-8 bg-muted/40 p-3 rounded-2xl border border-border/50">
            <span className="flex items-center gap-1.5 px-2">
              <Users className="h-4 w-4 text-primary/70" />
              {group.membersCount} membres
            </span>
            <div className="w-px h-4 bg-border/60" />
            <span className="flex items-center gap-1.5 px-2">
              <BarChart2 className="h-4 w-4 text-primary/70" />
              {group.activePollsCount} sondages
            </span>
          </div>

          <div className="mt-auto pt-2 z-30">
            {getStatusButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
