"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupCard } from "@/components/groups/group-card"
import { CreateGroupModal } from "@/components/groups/create-group-modal"
import { useGroupStore } from "@/store/group-store"
import { Plus, Search, Users } from "lucide-react"

export default function GroupsPage() {
  const { groups, myGroups } = useGroupStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredGroups = (groups || []).filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Combiner les groupes créés et rejoints
  const allMyGroups = [...(myGroups?.created || []), ...(myGroups?.joined || [])]

  const filteredMyGroups = allMyGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groupes</h1>
          <p className="text-muted-foreground">Gérez vos groupes et découvrez-en de nouveaux</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un groupe
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un groupe..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="my-groups" className="w-full">
        <TabsList>
          <TabsTrigger value="my-groups" className="gap-2">
            <Users className="h-4 w-4" />
            Mes groupes ({filteredMyGroups.length})
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <Search className="h-4 w-4" />
            Découvrir ({filteredGroups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="mt-6">
          {filteredMyGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Aucun groupe</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous n'avez pas encore rejoint de groupe. Découvrez les groupes publics dans l'onglet "Découvrir" et
                demandez à les rejoindre !
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMyGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-6">
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Aucun groupe trouvé</h3>
              <p className="mt-2 text-sm text-muted-foreground">Essayez avec d'autres termes de recherche</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGroupModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}
