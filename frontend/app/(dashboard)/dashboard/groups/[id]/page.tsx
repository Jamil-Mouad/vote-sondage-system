"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PollCard } from "@/components/polls/poll-card"
import { CreatePollModal } from "@/components/polls/create-poll-modal"
import { InviteMemberModal } from "@/components/groups/invite-member-modal"
import { useGroupStore } from "@/store/group-store"
import { usePollStore } from "@/store/poll-store"
import { ArrowLeft, Users, BarChart3, Plus, Settings, UserPlus, Crown, Shield, Copy, Check } from "lucide-react"

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { groups } = useGroupStore()
  const { polls } = usePollStore()
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState(false)

  const group = groups.find((g) => g.id === resolvedParams.id)
  const groupPolls = polls.filter((p) => p.groupId === resolvedParams.id)

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Groupe non trouvé</h2>
        <Button variant="link" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  const copyCode = () => {
    navigator.clipboard.writeText(group.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </Badge>
        )
      case "moderator":
        return (
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Modérateur
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Info groupe */}
        <Card className="lg:w-80">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={group.avatar || "/placeholder.svg?height=64&width=64&query=group"} />
                <AvatarFallback className="text-xl">{group.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant={group.isPrivate ? "secondary" : "outline"}>
                    {group.isPrivate ? "Privé" : "Public"}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{group.description}</p>

            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div>
                <p className="text-xs text-muted-foreground">Code d'invitation</p>
                <p className="font-mono font-semibold">{group.code}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-muted p-3">
                <Users className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1 text-lg font-semibold">{group.memberCount}</p>
                <p className="text-xs text-muted-foreground">Membres</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <BarChart3 className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1 text-lg font-semibold">{groupPolls.length}</p>
                <p className="text-xs text-muted-foreground">Sondages</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setShowInvite(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Inviter
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="flex-1">
          <Tabs defaultValue="polls">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="polls">Sondages</TabsTrigger>
                <TabsTrigger value="members">Membres</TabsTrigger>
              </TabsList>
              <Button size="sm" onClick={() => setShowCreatePoll(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau sondage
              </Button>
            </div>

            <TabsContent value="polls" className="mt-6">
              {groupPolls.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-medium">Aucun sondage</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Ce groupe n'a pas encore de sondage</p>
                    <Button className="mt-4" onClick={() => setShowCreatePoll(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un sondage
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {groupPolls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Membres ({group.members?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar || "/placeholder.svg?height=40&width=40&query=avatar"} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        {getRoleBadge(member.role)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreatePollModal open={showCreatePoll} onOpenChange={setShowCreatePoll} groupId={group.id} />
      <InviteMemberModal open={showInvite} onOpenChange={setShowInvite} groupCode={group.code} />
    </div>
  )
}
