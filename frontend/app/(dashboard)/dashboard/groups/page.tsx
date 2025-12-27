"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GroupCard } from "@/components/groups/group-card"
import { CreateGroupModal } from "@/components/groups/create-group-modal"
import { useGroupStore } from "@/store/group-store"
import { useThemeStore } from "@/store/theme-store"
import { Plus, Search, Users, Compass, Globe } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type FilterType = 'my-groups' | 'discover';

export default function GroupsPage() {
  const { groups, myGroups, fetchMyGroups, fetchPublicGroups, isLoading } = useGroupStore()
  const { theme } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('my-groups')

  useEffect(() => {
    fetchMyGroups()
    fetchPublicGroups()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (activeFilter === 'discover') {
      fetchPublicGroups(query)
    }
  }

  // Combiner les groupes créés et rejoints
  const allMyGroups = [...(myGroups?.created || []), ...(myGroups?.joined || [])]

  const filteredMyGroups = allMyGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredDiscoverGroups = (groups || []).filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Determine which list to show
  const displayedGroups = activeFilter === 'my-groups' ? filteredMyGroups : filteredDiscoverGroups.filter(g => g.membershipStatus === 'none' && g.myRole !== 'admin');

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-[var(--primary-700)] shadow-2xl dark:shadow-primary/20 p-8 sm:p-12 mb-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
          <div className="max-w-md space-y-4 text-center md:text-left text-white">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Groupes
              <span className="block text-xl font-normal text-primary-50 mt-2">
                Connectez-vous avec des communautés qui partagent vos intérêts.
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="rounded-full bg-white text-primary hover:bg-white/90 shadow-lg border-0 font-bold hover:scale-105 transition-transform"
              >
                <Plus className="mr-2 h-5 w-5" />
                Créer un groupe
              </Button>
            </div>
          </div>

          <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0 animate-in slide-in-from-right-12 duration-1000 group">
            <div className="absolute inset-0 bg-white/20 blur-[80px] rounded-full animate-pulse opacity-40 mix-blend-screen" />
            <div className="relative w-full h-full transform transition-transform hover:scale-105 duration-500 ease-out drop-shadow-2xl"
              style={{ animation: 'float 6s ease-in-out infinite' }}>
              <Image
                src={theme === 'dark' ? "/groupe-icon-dark-mode.png" : "/groupe-icon-light-mode.png"}
                alt="Groupes Hub"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>


      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Sidebar (Filtres & Stats) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="p-6 rounded-[2rem] bg-card/60 backdrop-blur-md border border-border/50 shadow-xl space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary/80">Navigation</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveFilter('my-groups')}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                      activeFilter === 'my-groups'
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Users className="h-5 w-5" />
                    Mes Groupes
                    <Badge variant="secondary" className="ml-auto bg-black/10 text-xs px-2 rounded-full border-none">
                      {filteredMyGroups.length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setActiveFilter('discover')}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                      activeFilter === 'discover'
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Compass className="h-5 w-5" />
                    Découvrir
                  </button>
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary/80">Recherche Rapide</h3>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Filtrer..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 rounded-xl border-primary/20 bg-background/50 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary/80">Statistiques</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
                    <p className="text-2xl font-black text-primary">{allMyGroups.length}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">Groupes Rejoins</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
                    <p className="text-2xl font-black text-purple-500">{displayedGroups.length}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter">Résultats trouvés</p>
                  </div>
                </div>
              </div>
            </div>

            {activeFilter === 'my-groups' && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-700))' }}
              >
                <Plus className="mr-2 h-6 w-6" />
                Créer un Groupe
              </Button>
            )}
          </div>
        </div>

        {/* Right Content Area (Grid) */}
        <div className="lg:col-span-9 min-h-[500px]">
          {displayedGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-primary/10 p-20 text-center bg-card/20 animate-in fade-in zoom-in-95">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                {activeFilter === 'my-groups' ? (
                  <Users className="h-12 w-12 text-primary" />
                ) : (
                  <Globe className="h-12 w-12 text-primary" />
                )}
              </div>
              <h3 className="text-2xl font-black mb-2">
                {activeFilter === 'my-groups' ? "Aucun groupe" : "Pas de nouveaux groupes"}
              </h3>
              <p className="text-muted-foreground max-w-xs font-medium mb-10">
                {activeFilter === 'my-groups'
                  ? "Vous n'avez pas encore rejoint de communauté. Commencez par en découvrir une !"
                  : "Il semble qu'il n'y ait pas d'autres groupes publics à explorer pour le moment."}
              </p>
              <Button
                variant="outline"
                onClick={() => activeFilter === 'my-groups' ? setActiveFilter('discover') : setShowCreateModal(true)}
                className="rounded-full h-12 px-8 border-primary/30 hover:bg-primary/5 font-bold"
              >
                {activeFilter === 'my-groups' ? "Explorer les groupes publics" : "Créer le premier groupe de la liste"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {displayedGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onUpdate={activeFilter === 'my-groups' ? fetchMyGroups : fetchPublicGroups}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
      `}</style>
    </div>
  )
}
