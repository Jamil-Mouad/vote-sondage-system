"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, UserCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useGroupStore } from "@/store/group-store"

interface PendingRequest {
  id: number
  user: {
    id: number
    username: string
    email: string
    avatarUrl?: string
  }
  createdAt: string
}

interface PendingRequestsCardProps {
  groupId: number
  requests: PendingRequest[]
  onUpdate?: () => void
}

export function PendingRequestsCard({ groupId, requests, onUpdate }: PendingRequestsCardProps) {
  const { handleJoinRequest } = useGroupStore()
  const [loadingRequests, setLoadingRequests] = useState<Set<number>>(new Set())

  const handleApprove = async (request: PendingRequest) => {
    setLoadingRequests((prev) => new Set(prev).add(request.id))
    try {
      const success = await handleJoinRequest(groupId, request.id, "approve")
      if (success) {
        toast.success(`${request.user.username} a été ajouté au groupe !`)
        onUpdate?.()
      }
    } catch (error) {
      toast.error("Erreur lors de l'acceptation")
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(request.id)
        return newSet
      })
    }
  }

  const handleReject = async (request: PendingRequest) => {
    setLoadingRequests((prev) => new Set(prev).add(request.id))
    try {
      const success = await handleJoinRequest(groupId, request.id, "reject")
      if (success) {
        toast.success("Demande refusée")
        onUpdate?.()
      }
    } catch (error) {
      toast.error("Erreur lors du refus")
    } finally {
      setLoadingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(request.id)
        return newSet
      })
    }
  }

  if (requests.length === 0) {
    return null
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserCheck className="h-5 w-5" />
          Demandes d'adhésion
          <Badge variant="secondary">{requests.length}</Badge>
        </CardTitle>
        <CardDescription>Gérez les demandes pour rejoindre ce groupe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request) => {
            const isLoading = loadingRequests.has(request.id)
            return (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={request.user.avatarUrl || "/placeholder.svg?height=40&width=40&query=avatar"}
                    />
                    <AvatarFallback>{request.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.user.username}</p>
                    <p className="text-xs text-muted-foreground">{request.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                    onClick={() => handleApprove(request)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => handleReject(request)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
