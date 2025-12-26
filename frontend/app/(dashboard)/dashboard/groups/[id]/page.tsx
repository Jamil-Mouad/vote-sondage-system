"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PollCard } from "@/components/polls/poll-card"
import { CreatePollModal } from "@/components/polls/create-poll-modal"
import { InviteMemberModal } from "@/components/groups/invite-member-modal"
import { PendingRequestsCard } from "@/components/groups/pending-requests-card"
import { useGroupStore } from "@/store/group-store"
import { usePollStore } from "@/store/poll-store"
import { ArrowLeft, Users, BarChart3, Plus, Settings, UserPlus, Crown, Shield, Copy, Check, Loader2, Clock, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = parseInt(resolvedParams.id)
  const router = useRouter()
  const { currentGroup, currentGroupRequests, fetchGroupById, fetchGroupRequests, isLoading: loadingGroup } = useGroupStore()
  const { polls, fetchGroupPolls, isLoading: loadingPolls } = usePollStore()
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const g = await fetchGroupById(groupId)
      if (g?.myRole === "admin") {
        fetchGroupRequests(groupId)
      }
      fetchGroupPolls(groupId)
    }
    loadData()
  }, [groupId])

  const group = currentGroup
  const groupPolls = polls.filter((p) => p.groupId === groupId)
  const pendingRequests = currentGroupRequests

  if (loadingGroup) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Chargement de votre espace groupe...</p>
      </div>
    )
  }

  if (!group || group.id !== groupId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Groupe non trouvé</h2>
          <p className="text-muted-foreground mt-1">Ce groupe n'existe pas ou vous n'y avez pas accès.</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/groups')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux groupes
        </Button>
      </div>
    )
  }

  const groupCode = `GRP-${group.id}`

  const copyCode = () => {
    navigator.clipboard.writeText(groupCode)
    setCopied(true)
    toast.success("Code copié !")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Hero Section / Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group hover:bg-primary/10 hover:text-primary transition-all rounded-full pl-2 pr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Group Info (Sticky) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-6 overflow-hidden border-none shadow-xl bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
            {/* Header decoration */}
            <div className="h-32 w-full bg-gradient-to-br from-primary to-primary-700 relative">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -bottom-12 left-6 ring-4 ring-background rounded-2xl overflow-hidden bg-background">
                <Avatar className="h-24 w-24 rounded-2xl">
                  <AvatarFallback className="text-3xl bg-primary text-white font-bold">
                    {group.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardContent className="pt-16 pb-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
                  {group.myRole === 'admin' && <Crown className="h-5 w-5 text-amber-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={group.isPublic ? "outline" : "secondary"}>
                    {group.isPublic ? "Public" : "Privé"}
                  </Badge>
                  {group.myRole === "admin" && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900 ring-0">Admin</Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {group.description || "Un espace collaboratif pour échanger et voter sur des propositions importantes."}
              </p>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Invitation</Label>
                <div className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Code du groupe</p>
                    <p className="font-mono font-bold tracking-widest text-primary">{groupCode}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={copyCode} className="h-10 w-10 hover:bg-primary/10">
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center hover:bg-muted/30 transition-colors">
                  <Users className="mx-auto h-5 w-5 text-primary/70 mb-2" />
                  <p className="text-2xl font-bold">{group.membersCount}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Membres</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center hover:bg-muted/30 transition-colors">
                  <BarChart3 className="mx-auto h-5 w-5 text-primary/70 mb-2" />
                  <p className="text-2xl font-bold">{groupPolls.length}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Sondages</p>
                </div>
              </div>

              <div className="flex gap-2">
                {group.myRole === "admin" ? (
                  <>
                    <Button className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-primary/20" onClick={() => setShowInvite(true)} style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-700))' }}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Inviter
                    </Button>
                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-primary/20 text-primary hover:bg-primary/5">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Button className="w-full rounded-xl h-11 font-bold shadow-lg shadow-primary/20" onClick={() => setShowInvite(true)} style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-700))' }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager le groupe
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Admin Pending Requests Alert */}
          {group.myRole === "admin" && pendingRequests.length > 0 && (
            <div className="animate-in slide-in-from-top-4 duration-500">
              <PendingRequestsCard
                groupId={group.id}
                requests={pendingRequests}
                onUpdate={() => fetchGroupById(groupId)}
              />
            </div>
          )}

          <Tabs defaultValue="polls" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="polls" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">
                  Sondages
                </TabsTrigger>
                <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">
                  Communauté
                </TabsTrigger>
              </TabsList>

              {group.myRole === "admin" && (
                <Button size="sm" onClick={() => setShowCreatePoll(true)} className="rounded-full px-4 h-9 shadow-md bg-primary hover:bg-primary-700 border-none transition-all hover:scale-105">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau sondage
                </Button>
              )}
            </div>

            <TabsContent value="polls" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {loadingPolls ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Synchronisation des votes...</p>
                </div>
              ) : groupPolls.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/5">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                      <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold">Aucun sondage actif</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                      {group.myRole === "admin"
                        ? "Prenez les devants en créant le premier sondage pour votre communauté !"
                        : "L'administrateur n'a pas encore publié de sondage. Repassez plus tard !"}
                    </p>
                    {group.myRole === "admin" && (
                      <Button className="mt-8 rounded-full h-11 px-8" onClick={() => setShowCreatePoll(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer le premier sondage
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {groupPolls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} onVote={() => fetchGroupPolls(groupId)} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Membres du groupe</CardTitle>
                  <CardDescription>Liste des membres participant aux votes et aux échanges.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {/* Member list remains placeholder as requested to focus on UI for polls/vote */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/5 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">Vous</p>
                          <p className="text-xs text-muted-foreground">{group.myRole === 'admin' ? 'Propriétaire du groupe' : 'Membre actif'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-full px-3">{group.myRole === 'admin' ? 'Admin' : 'Membre'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreatePollModal open={showCreatePoll} onOpenChange={setShowCreatePoll} groupId={group.id} onSuccess={() => fetchGroupPolls(groupId)} />
      <InviteMemberModal open={showInvite} onOpenChange={setShowInvite} groupCode={groupCode} />
    </div>
  )
}
