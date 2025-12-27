import { create } from "zustand"
import { apiRequest } from "@/lib/api-client"

export interface Group {
  id: number
  name: string
  description?: string
  isPublic: boolean
  membersCount: number
  activePollsCount: number
  pendingRequests?: number
  membershipStatus: "none" | "pending" | "approved" | "rejected"
  myRole?: "member" | "admin" | "none"
  createdBy: number
  creatorName?: string
  createdAt: string
  polls?: any[] // Simplified for now
}

export interface GroupStatistics {
  groupId: number
  totalMembers: number
  polls: {
    pollId: number
    question: string
    pollType: "poll" | "vote" | "binary_poll"
    status: "active" | "ended" | "cancelled"
    endTime: string
    totalVotes: number
    totalMembers: number
    participationRate: number
    topVoters: {
      id: number
      name: string
      email: string
      avatar?: string
      votedAt: string
    }[]
  }[]
}

interface GroupState {
  groups: Group[]
  myGroups: { created: Group[]; joined: Group[] }
  currentGroup: Group | null
  currentGroupRequests: any[]
  currentStatistics: GroupStatistics | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchPublicGroups: (search?: string) => Promise<void>
  fetchMyGroups: () => Promise<void>
  fetchGroupById: (id: number) => Promise<Group | null>
  fetchGroupStatistics: (id: number) => Promise<GroupStatistics | null>
  createGroup: (data: { name: string; description?: string; isPublic: boolean }) => Promise<{ success: boolean; groupId?: number; error?: string }>
  joinGroup: (id: number) => Promise<boolean>
  leaveGroup: (id: number) => Promise<boolean>
  requestToJoin: (id: number) => Promise<boolean>
  handleJoinRequest: (groupId: number, requestId: number, action: "approve" | "reject") => Promise<boolean>
  fetchGroupRequests: (groupId: number) => Promise<void>
  deleteGroup: (id: number) => Promise<boolean>
  setLoading: (loading: boolean) => void
  setGroups: (groups: Group[]) => void
  clearError: () => void
}

// Helper to map backend data to frontend Group interface
const mapGroupData = (data: any): Group => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isPublic: !!data.is_public || !!data.isPublic,
    membersCount: data.membersCount || data.members_count || 0,
    activePollsCount: data.activePollsCount !== undefined ? data.activePollsCount : (data.activePolls ? data.activePolls.length : 0),
    pendingRequests: data.pendingRequests || data.pending_requests || 0,
    membershipStatus: data.membershipStatus || data.status || "none",
    myRole: data.myRole || data.role || "none",
    createdBy: data.created_by || data.createdBy,
    creatorName: data.creator_name || data.creatorName,
    createdAt: data.created_at || data.createdAt,
    polls: data.activePolls || []
  }
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  myGroups: { created: [], joined: [] },
  currentGroup: null,
  currentGroupRequests: [],
  currentStatistics: null,
  isLoading: false,
  error: null,

  fetchPublicGroups: async (search) => {
    set({ isLoading: true, error: null })
    try {
      const endpoint = search ? `/groups/public?search=${encodeURIComponent(search)}` : "/groups/public"
      const response = await apiRequest<any[]>(endpoint)
      if (response.success && response.data) {
        set({ groups: response.data.map(mapGroupData), isLoading: false })
      } else {
        set({ error: response.message || "Erreur lors du chargement", isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
    }
  },

  fetchMyGroups: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<{ created: any[]; joined: any[] }>("/groups/my-groups")
      if (response.success && response.data) {
        const created = (response.data.created || []).map(mapGroupData)
        const joined = (response.data.joined || []).map(mapGroupData)
        set({ myGroups: { created, joined }, isLoading: false })
      } else {
        set({ error: response.message || "Erreur lors du chargement des groupes", isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
    }
  },

  fetchGroupById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<any>(`/groups/${id}`)
      if (response.success && response.data) {
        const group = mapGroupData(response.data)
        set({ currentGroup: group, isLoading: false })
        return group
      } else {
        set({ error: response.message || "Groupe non trouvé", isLoading: false })
        return null
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return null
    }
  },

  fetchGroupStatistics: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<GroupStatistics>(`/groups/${id}/statistics`)
      if (response.success && response.data) {
        set({ currentStatistics: response.data, isLoading: false })
        return response.data
      } else {
        set({ error: response.message || "Statistiques non disponibles", isLoading: false })
        return null
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return null
    }
  },

  createGroup: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<{ groupId: number }>(`/groups`, {
        method: "POST",
        body: JSON.stringify(data),
      })
      set({ isLoading: false })
      if (response.success && response.data) {
        get().fetchMyGroups()
        return { success: true, groupId: response.data.groupId }
      } else {
        return { success: false, error: response.message || "Erreur lors de la création" }
      }
    } catch (error: any) {
      set({ isLoading: false })
      return { success: false, error: error.message || "Erreur réseau" }
    }
  },

  joinGroup: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest(`/groups/${id}/join`, { method: "POST" })
      set({ isLoading: false })
      if (response.success) {
        get().fetchPublicGroups() // Refresh groups to show new status
        return true
      } else {
        set({ error: response.message || "Erreur lors de l'adhésion" })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return false
    }
  },

  requestToJoin: async (id) => {
    return get().joinGroup(id)
  },

  leaveGroup: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest(`/groups/${id}/leave`, { method: "DELETE" })
      set({ isLoading: false })
      if (response.success) {
        get().fetchMyGroups()
        return true
      } else {
        set({ error: response.message || "Erreur lors du départ du groupe" })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return false
    }
  },

  fetchGroupRequests: async (groupId) => {
    try {
      const response = await apiRequest<any[]>(`/groups/${groupId}/requests`)
      if (response.success && response.data) {
        // Map backend snake_case to frontend camelCase
        const mapped = (response.data || []).map((r: any) => ({
          id: r.id,
          user: {
            id: r.user_id,
            username: r.username,
            email: r.email,
            avatarUrl: r.avatar_url
          },
          createdAt: r.joined_at
        }))
        set({ currentGroupRequests: mapped })
      }
    } catch (error) {
      console.error("Failed to fetch requests", error)
    }
  },

  handleJoinRequest: async (groupId, requestId, action) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest(`/groups/${groupId}/requests/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({ action }),
      })
      set({ isLoading: false })
      if (response.success) {
        get().fetchGroupById(groupId) // Refresh to show updated member count / requests
        get().fetchGroupRequests(groupId) // Refresh the list of pending requests
        return true
      } else {
        set({ error: response.message || "Erreur lors du traitement de la demande" })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return false
    }
  },

  deleteGroup: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest(`/groups/${id}`, { method: "DELETE" })
      set({ isLoading: false })
      if (response.success) {
        get().fetchMyGroups()
        return true
      } else {
        set({ error: response.message || "Erreur lors de la suppression du groupe" })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return false
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setGroups: (groups) => set({ groups }),
  clearError: () => set({ error: null }),
}))
