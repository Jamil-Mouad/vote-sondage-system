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
import Link from "next/link"
import { useGroupStore } from "@/store/group-store"
import { usePollStore } from "@/store/poll-store"
import { useAuthStore } from "@/store/auth-store"
import { ArrowLeft, Users, BarChart3, Plus, Settings, UserPlus, Crown, Shield, Copy, Check, Loader2, Clock, Share2, Globe, Lock } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = parseInt(resolvedParams.id)
  const router = useRouter()
  const { currentGroup, currentGroupRequests, fetchGroupById, fetchGroupRequests, isLoading: loadingGroup } = useGroupStore()
  const { polls, fetchGroupPolls, isLoading: loadingPolls } = usePollStore()
  const { user } = useAuthStore()
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
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-6 px-1">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Accueil</Link>
        <span className="opacity-40">/</span>
        <Link href="/dashboard/groups" className="hover:text-primary transition-colors">Groupes</Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground/80">{group.name}</span>
      </nav>

      {/* Header Banner Section (Pleine Largeur) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-700 to-indigo-900 shadow-2xl mb-10 group/banner">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-lg backdrop-blur-md"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">
                  {group.name}
                </h1>
                {group.myRole === 'admin' && (
                  <div className="bg-amber-400 p-1.5 rounded-xl shadow-lg ring-4 ring-white/10">
                    <Crown className="h-5 w-5 text-amber-900 fill-amber-900" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="rounded-full bg-white/20 text-white border-none backdrop-blur-md px-4 py-1 font-bold">
                  {group.isPublic ? <Globe className="h-3 w-3 mr-1.5" /> : <Lock className="h-3 w-3 mr-1.5" />}
                  {group.isPublic ? "Public" : "Privé"}
                </Badge>
                <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="text-sm font-medium text-white/80">{group.membersCount} membres actifs</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {group.myRole === "admin" && (
              <Button
                onClick={() => setShowCreatePoll(true)}
                className="rounded-full h-14 px-8 bg-white text-primary hover:bg-white/90 shadow-xl border-0 font-black hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="mr-2 h-6 w-6" />
                Nouveau Sondage
              </Button>
            )}
            <Button
              variant="secondary"
              className="h-14 w-14 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md shadow-lg"
              onClick={() => setShowInvite(true)}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Barre Latérale (Sidebar Gauche - 30%) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Main Info Card */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/80">À propos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground font-medium italic">
                "{group.description || "Un espace collaboratif pour échanger et voter sur des propositions importantes."}"
              </p>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Code d'invitation</Label>
                <div className="flex items-center justify-between rounded-2xl bg-muted/40 border border-border/50 p-4 transition-all hover:bg-muted/60 group/code cursor-pointer" onClick={copyCode}>
                  <div className="space-y-0.5">
                    <p className="font-mono font-black text-xl tracking-[0.2em] text-primary">{groupCode}</p>
                  </div>
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                    copied ? "bg-green-500 text-white" : "bg-primary/10 text-primary group-hover/code:scale-110"
                  )}>
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{group.membersCount}</p>
                    <p className="text-[10px] uppercase font-black text-muted-foreground/60">Membres de la communauté</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{groupPolls.length}</p>
                    <p className="text-[10px] uppercase font-black text-muted-foreground/60">Sondages réalisés</p>
                  </div>
                </div>
              </div>

              {group.myRole === 'admin' && (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-bold"
                  onClick={() => router.push(`/dashboard/groups/${group.id}/statistics`)}
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Tableau de bord statistique
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Admin Pending Requests - Integrated in Sidebar */}
          {group.myRole === "admin" && pendingRequests.length > 0 && (
            <div className="animate-in slide-in-from-left-4 duration-500">
              <PendingRequestsCard
                groupId={group.id}
                requests={pendingRequests}
                onUpdate={() => fetchGroupById(groupId)}
              />
            </div>
          )}
        </div>

        {/* Flux de Contenu (Centre - 70%) */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="polls" className="w-full">
            <div className="bg-muted/20 p-1.5 rounded-[1.5rem] border border-border/50 inline-flex mb-8">
              <TabsList className="bg-transparent gap-2 h-auto p-0">
                <TabsTrigger value="polls" className="rounded-2xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg px-8 py-3 font-bold transition-all">
                  Sondages
                </TabsTrigger>
                <TabsTrigger value="members" className="rounded-2xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg px-8 py-3 font-bold transition-all">
                  Communauté
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="polls" className="animate-in fade-in slide-in-from-bottom-6 duration-500 focus-visible:outline-none">
              {loadingPolls ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Synchronisation des données...</p>
                </div>
              ) : groupPolls.length === 0 ? (
                <Card className="rounded-[3rem] border-dashed border-4 border-muted/50 bg-card/20 py-24">
                  <CardContent className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mb-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Pas encore de sondage</h3>
                    <p className="text-muted-foreground max-w-sm font-medium mb-10">
                      C'est l'endroit idéal pour poser des questions et prendre des décisions collectives.
                    </p>
                    {group.myRole === "admin" && (
                      <Button
                        size="lg"
                        className="rounded-full h-14 px-10 font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                        onClick={() => setShowCreatePoll(true)}
                      >
                        <Plus className="mr-2 h-6 w-6" />
                        Lancer le premier sondage
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 grid-cols-1">
                  {groupPolls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} onVote={() => fetchGroupPolls(groupId)} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="animate-in fade-in slide-in-from-bottom-6 duration-500 focus-visible:outline-none">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden ring-1 ring-border/50">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black">Membres du groupe</CardTitle>
                  <CardDescription className="font-medium text-muted-foreground/70">Les personnes qui font vivre cette communauté.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="grid gap-3">
                    {/* Placeholder content cleaned up and made modern */}
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all hover:translate-x-1 group">
                      <div className="flex items-center gap-5">
                        <Avatar className="h-14 w-14 ring-4 ring-primary/10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-700 text-white font-black text-xl">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-lg text-foreground">
                            {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name}
                            <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Vous</span>
                          </p>
                          <p className="text-sm font-bold text-muted-foreground/60">{group.myRole === 'admin' ? 'Fondateur & Administrateur' : 'Membre actif'}</p>
                        </div>
                      </div>
                      {group.myRole === 'admin' && (
                        <div className="bg-amber-400/20 text-amber-700 p-2 rounded-xl group-hover:scale-110 transition-transform">
                          <Crown className="h-5 w-5" />
                        </div>
                      )}
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
