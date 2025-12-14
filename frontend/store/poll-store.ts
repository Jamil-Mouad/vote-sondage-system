import { create } from "zustand"
import { apiRequest } from "@/lib/api-client"

export interface PollOption {
  option: string
  votes: number
  percentage: number
}

export interface Poll {
  id: number
  question: string
  description?: string
  options: string[]
  end_time: string
  status: "active" | "ended" | "cancelled"
  is_public: boolean
  group_id?: number
  totalVotes: number
  created_by: number
  creatorName?: string
  creatorAvatar?: string
  hasVoted: boolean
  myVote?: number
  results?: {
    totalVotes: number
    results: PollOption[]
  }
  created_at: string
}

export interface PollStats {
  poll: {
    id: number
    question: string
    description?: string
    options: string[]
    endTime: string
    status: string
    isPublic: boolean
    createdAt: string
  }
  totalVotes: number
  participationRate: number
  optionStats: {
    option: string
    optionIndex: number
    votes: number
    percentage: number
  }[]
  votesOverTime: { date: string; count: number }[]
  votersByOption: {
    [key: number]: {
      id: number
      name: string
      email: string
      avatar?: string
      votedAt: string
    }[]
  }
}

interface PollState {
  polls: Poll[]
  myPolls: Poll[]
  history: { activePolls: Poll[]; endedPolls: Poll[] }
  currentPoll: Poll | null
  currentStats: PollStats | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }

  // Actions
  fetchPublicPolls: (params?: { page?: number; limit?: number; status?: string; search?: string }) => Promise<void>
  fetchMyPolls: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>
  fetchPollById: (id: number) => Promise<Poll | null>
  fetchPollStats: (id: number) => Promise<PollStats | null>
  fetchHistory: () => Promise<void>
  createPoll: (data: {
    question: string
    description?: string
    options: { text: string }[]
    endTime: string
    isPublic: boolean
    groupId?: number
  }) => Promise<{ success: boolean; pollId?: number; error?: string }>
  updatePoll: (id: number, data: { question?: string; description?: string; endTime?: string }) => Promise<boolean>
  cancelPoll: (id: number) => Promise<boolean>
  vote: (pollId: number, optionSelected: number) => Promise<boolean>
  setLoading: (loading: boolean) => void
  clearError: () => void
}

export const usePollStore = create<PollState>((set, get) => ({
  polls: [],
  myPolls: [],
  history: { activePolls: [], endedPolls: [] },
  currentPoll: null,
  currentStats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  fetchPublicPolls: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { page = 1, limit = 10, status = "active", search } = params
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status,
      })
      if (search) queryParams.append("search", search)

      const response = await apiRequest<Poll[]>(`/polls/public?${queryParams}`)
      
      if (response.success && response.data) {
        const polls = response.data.map(poll => ({
          ...poll,
          options: typeof poll.options === 'string' ? JSON.parse(poll.options as unknown as string) : poll.options,
        }))
        set({ 
          polls, 
          isLoading: false,
          pagination: { ...get().pagination, page, limit }
        })
      } else {
        set({ error: response.message || "Erreur lors du chargement", isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
    }
  },

  fetchMyPolls: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { page = 1, limit = 10, status } = params
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (status) queryParams.append("status", status)

      const response = await apiRequest<Poll[]>(`/polls/my-polls?${queryParams}`)
      
      if (response.success && response.data) {
        const myPolls = response.data.map(poll => ({
          ...poll,
          options: typeof poll.options === 'string' ? JSON.parse(poll.options as unknown as string) : poll.options,
        }))
        set({ myPolls, isLoading: false })
      } else {
        set({ error: response.message || "Erreur lors du chargement", isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
    }
  },

  fetchPollById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<Poll>(`/polls/${id}`)
      
      if (response.success && response.data) {
        const poll = {
          ...response.data,
          options: typeof response.data.options === 'string' 
            ? JSON.parse(response.data.options as unknown as string) 
            : response.data.options,
        }
        set({ currentPoll: poll, isLoading: false })
        return poll
      } else {
        set({ error: response.message || "Sondage non trouvé", isLoading: false })
        return null
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return null
    }
  },

  fetchPollStats: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<PollStats>(`/polls/${id}/stats`)
      
      if (response.success && response.data) {
        set({ currentStats: response.data, isLoading: false })
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

  fetchHistory: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<{ activePolls: Poll[]; endedPolls: Poll[] }>(`/polls/history`)
      
      if (response.success && response.data) {
        set({ history: response.data, isLoading: false })
      } else {
        set({ error: response.message || "Erreur lors du chargement", isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
    }
  },

  createPoll: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<{ pollId: number }>(`/polls`, {
        method: "POST",
        body: JSON.stringify(data),
      })
      
      set({ isLoading: false })
      
      if (response.success && response.data) {
        // Refresh my polls after creation
        get().fetchMyPolls()
        return { success: true, pollId: response.data.pollId }
      } else {
        return { success: false, error: response.message || "Erreur lors de la création" }
      }
    } catch (error: any) {
      set({ isLoading: false })
      return { success: false, error: error.message || "Erreur réseau" }
    }
  },

  updatePoll: async (id: number, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest(`/polls/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      
      set({ isLoading: false })
      
      if (response.success) {
        // Refresh my polls after update
        get().fetchMyPolls()
        return true
      } else {
        set({ error: response.message || "Erreur lors de la mise à jour" })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return false
    }
  },

  cancelPoll: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest(`/polls/${id}`, {
        method: "DELETE",
      })
      
      set({ isLoading: false })
      
      if (response.success) {
        // Remove from myPolls
        set((state) => ({
          myPolls: state.myPolls.filter(p => p.id !== id)
        }))
        return true
      } else {
        set({ error: response.message || "Erreur lors de l'annulation" })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return false
    }
  },

  vote: async (pollId: number, optionSelected: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest(`/votes`, {
        method: "POST",
        body: JSON.stringify({ pollId, optionSelected }),
      })
      
      set({ isLoading: false })
      
      if (response.success) {
        // Update local state to reflect the vote
        set((state) => ({
          polls: state.polls.map(p => 
            p.id === pollId 
              ? { ...p, hasVoted: true, myVote: optionSelected, totalVotes: p.totalVotes + 1 }
              : p
          ),
          currentPoll: state.currentPoll?.id === pollId
            ? { ...state.currentPoll, hasVoted: true, myVote: optionSelected, totalVotes: state.currentPoll.totalVotes + 1 }
            : state.currentPoll
        }))
        return true
      } else {
        set({ error: response.message || "Erreur lors du vote" })
        throw new Error(response.message || "Erreur lors du vote")
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      throw error
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  clearError: () => set({ error: null }),
}))
