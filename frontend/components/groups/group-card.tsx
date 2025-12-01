"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { groupsApi } from "@/lib/api"
import type { Group } from "@/store/group-store"
import { Users, BarChart2, Clock, Check, Crown, Loader2 } from "lucide-react"

interface GroupCardProps {
  group: Group
  onUpdate?: () => void
}

export function GroupCard({ group, onUpdate }: GroupCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleJoin = async () => {
    setIsLoading(true)
    try {
      await groupsApi.joinGroup(group.id)
      toast.success("Demande d'adhésion envoyée !")
      onUpdate?.()
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
            variant="outline"
            className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 bg-transparent"
            asChild
          >
            <Link href={`/dashboard/groups/${group.id}`}>
              <Check className="h-4 w-4 mr-2" />
              Membre
            </Link>
          </Button>
        )
      case "pending":
        return (
          <Button variant="outline" className="w-full bg-transparent" disabled>
            <Clock className="h-4 w-4 mr-2" />
            En attente
          </Button>
        )
      default:
        return (
          <Button
            variant="outline"
            className="w-full bg-transparent"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
            Demander à rejoindre
          </Button>
        )
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div
          className="h-24 relative"
          style={{
            background: `linear-gradient(135deg, var(--primary), var(--primary-700))`,
          }}
        >
          {group.myRole === "admin" && (
            <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
          {!group.isPublic && (
            <Badge variant="secondary" className="absolute top-3 left-3">
              Privé
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{group.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {group.membersCount} membres
            </span>
            <span className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              {group.activePolls} sondages actifs
            </span>
          </div>

          {getStatusButton()}
        </div>
      </CardContent>
    </Card>
  )
}
