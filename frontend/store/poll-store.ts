import { create } from "zustand"
import { apiRequest } from "@/lib/api-client"

export interface PollOption {
  index: number
  text: string
  votes: number
  percentage: number
}

export interface Poll {
  id: number
  question: string
  description?: string
  options: PollOption[]
  endTime: string
  status: "active" | "ended" | "cancelled"
  isPublic: boolean
  groupId?: number
  pollType: "poll" | "vote" | "binary_poll"
  showResultsOnVote: boolean
  canSeeResults?: boolean
  totalVotes: number
  createdBy: number
  creatorName?: string
  creatorAvatar?: string
  hasVoted: boolean
  myVote?: number
  results?: {
    totalVotes: number
    results: PollOption[]
  }
  isCreator: boolean
  createdAt: string
}

export interface PollStats {
  poll: Poll
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
  votesHistory: Poll[]
  pollsHistory: Poll[]
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
  fetchGroupPolls: (groupId: number) => Promise<void>
  fetchHistory: () => Promise<void>
  fetchEnhancedHistory: () => Promise<void>
  createPoll: (data: {
    question: string
    description?: string
    options: { text: string }[]
    endTime: string
    isPublic: boolean
    groupId?: number
    pollType?: "poll" | "vote" | "binary_poll"
    isBinary?: boolean
  }) => Promise<{ success: boolean; pollId?: number; error?: string }>
  updatePoll: (id: number, data: { question?: string; description?: string; endTime?: string }) => Promise<boolean>
  cancelPoll: (id: number) => Promise<boolean>
  vote: (pollId: number, optionSelected: number) => Promise<boolean>
  updatePollResults: (pollId: number, results: any) => void
  setLoading: (loading: boolean) => void
  setPolls: (polls: Poll[]) => void
  clearError: () => void
}

// Helper to map backend data to frontend CamelCase Poll interface
const mapPollData = (data: any, currentUserId?: number): Poll => {
  const rawOptions = Array.isArray(data.options)
    ? data.options
    : typeof data.options === "string"
      ? JSON.parse(data.options)
      : [];

  // Map backend results to frontend PollOption (using 'text' instead of 'option')
  const mappedResults = data.results?.results?.map((r: any, idx: number) => ({
    index: r.index !== undefined ? r.index : idx + 1,
    text: r.option || r.text,
    votes: r.votes || 0,
    percentage: r.percentage || 0
  }))

  const mappedOptions: PollOption[] = rawOptions.map((opt: any, index: number) => {
    const text = typeof opt === 'string' ? opt : (opt.text || opt.option)
    const result = mappedResults?.find((r: any) => r.text === text)

    return {
      index: opt.index !== undefined ? opt.index : index + 1,
      text: text,
      votes: result?.votes || opt.votes || 0,
      percentage: result?.percentage || opt.percentage || 0
    }
  })

  return {
    id: data.id,
    question: data.question,
    description: data.description,
    options: mappedOptions,
    endTime: data.end_time || data.endTime,
    status: data.status,
    isPublic: data.is_public !== undefined ? !!data.is_public : !!data.isPublic,
    groupId: data.group_id || data.groupId,
    pollType: data.poll_type || data.pollType || 'poll',
    showResultsOnVote: data.show_results_on_vote !== undefined ? !!data.show_results_on_vote : (data.showResultsOnVote !== undefined ? !!data.showResultsOnVote : true),
    canSeeResults: data.canSeeResults,
    totalVotes: data.totalVotes || 0,
    createdBy: data.created_by || data.createdBy,
    creatorName: data.creator_name || data.creatorName,
    creatorAvatar: data.creator_avatar || data.creatorAvatar,
    hasVoted: !!data.hasVoted,
    myVote: data.myVote,
    results: data.results ? {
      totalVotes: data.results.totalVotes,
      results: mappedResults
    } : undefined,
    isCreator: currentUserId !== undefined && (data.created_by === currentUserId || data.createdBy === currentUserId),
    createdAt: data.created_at || data.createdAt,
  }
}

export const usePollStore = create<PollState>((set, get) => ({
  polls: [],
  myPolls: [],
  history: { activePolls: [], endedPolls: [] },
  votesHistory: [],
  pollsHistory: [],
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

      const response = await apiRequest<any[]>(`/polls/public?${queryParams}`)

      if (response.success && response.data) {
        // Try to get current user ID to determine isCreator
        let userId: number | undefined
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.user?.id) userId = Number(parsed.state.user.id)
        }

        const polls = response.data.map(poll => mapPollData(poll, userId))
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

      const response = await apiRequest<any[]>(`/polls/my-polls?${queryParams}`)

      if (response.success && response.data) {
        let userId: number | undefined
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.user?.id) userId = Number(parsed.state.user.id)
        }

        const myPolls = response.data.map(poll => mapPollData(poll, userId))
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
      const response = await apiRequest<any>(`/polls/${id}`)

      if (response.success && response.data) {
        let userId: number | undefined
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.user?.id) userId = Number(parsed.state.user.id)
        }

        const poll = mapPollData(response.data, userId)
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
      const response = await apiRequest<any>(`/polls/${id}/stats`)

      if (response.success && response.data) {
        let userId: number | undefined
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.user?.id) userId = Number(parsed.state.user.id)
        }

        const stats: PollStats = {
          ...response.data,
          poll: mapPollData(response.data.poll, userId)
        }
        set({ currentStats: stats, isLoading: false })
        return stats
      } else {
        set({ error: response.message || "Statistiques non disponibles", isLoading: false })
        return null
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
      return null
    }
  },

  fetchGroupPolls: async (groupId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<any>(`/groups/${groupId}/polls`)
      if (response.success) {
        // Logic to get current user ID if needed for isCreator
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const currentUser = userStr ? JSON.parse(userStr) : null
        const currentUserId = currentUser?.id

        const mappedPolls = (response.data || []).map((p: any) => mapPollData(p, currentUserId))
        set({ polls: mappedPolls, isLoading: false })
      } else {
        set({ error: response.message || "Erreur lors du chargement des sondages du groupe", isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
    }
  },

  fetchHistory: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<{ activePolls: any[]; endedPolls: any[] }>(`/polls/history`)

      if (response.success && response.data) {
        let userId: number | undefined
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.user?.id) userId = Number(parsed.state.user.id)
        }

        set({
          history: {
            activePolls: response.data.activePolls.map(p => mapPollData(p, userId)),
            endedPolls: response.data.endedPolls.map(p => mapPollData(p, userId))
          },
          isLoading: false
        })
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
      const response = await apiRequest<any>(`/votes`, {
        method: "POST",
        body: JSON.stringify({ pollId, optionSelected }),
      })

      set({ isLoading: false })

      if (response.success) {
        // L'API renvoie souvent le sondage mis à jour ou les nouveaux résultats
        // On rafraîchit le sondage actuel s'il correspond
        if (get().currentPoll?.id === pollId) {
          get().fetchPollById(pollId)
        }

        // Mettre à jour localement pour un retour immédiat
        set((state) => ({
          polls: state.polls.map(p =>
            p.id === pollId
              ? { ...p, hasVoted: true, myVote: optionSelected, totalVotes: p.totalVotes + 1 }
              : p
          )
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

  fetchEnhancedHistory: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiRequest<{ votes: any[]; polls: any[] }>(`/polls/history/enhanced`)

      if (response.success && response.data) {
        let userId: number | undefined
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.user?.id) userId = Number(parsed.state.user.id)
        }

        set({
          votesHistory: response.data.votes.map(v => mapPollData(v, userId)),
          pollsHistory: response.data.polls.map(p => mapPollData(p, userId)),
          isLoading: false
        })
      } else {
        set({ error: response.message || "Erreur lors du chargement", isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message || "Erreur réseau", isLoading: false })
    }
  },

  updatePollResults: (pollId, results) => {
    // Determine the new total votes and mapped results
    const totalVotes = results.totalVotes || 0;
    const mappedResults = results.results || [];

    const updatePollItem = (p: Poll) => {
      if (p.id !== pollId) return p;

      // Update options with new results
      const updatedOptions = p.options.map(opt => {
        const result = mappedResults.find((r: any) => (r.text || r.option) === opt.text);
        if (result) {
          return {
            ...opt,
            votes: result.votes,
            percentage: result.percentage
          };
        }
        return opt;
      });

      return {
        ...p,
        totalVotes,
        results: {
          totalVotes,
          results: mappedResults
        },
        options: updatedOptions
      };
    };

    set((state) => ({
      polls: state.polls.map(updatePollItem),
      myPolls: state.myPolls.map(updatePollItem),
      currentPoll: state.currentPoll && state.currentPoll.id === pollId
        ? updatePollItem(state.currentPoll)
        : state.currentPoll,
      history: {
        activePolls: state.history.activePolls.map(updatePollItem),
        endedPolls: state.history.endedPolls.map(updatePollItem)
      },
      votesHistory: state.votesHistory.map(updatePollItem),
      pollsHistory: state.pollsHistory.map(updatePollItem)
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),
  setPolls: (polls) => set({ polls }),
  clearError: () => set({ error: null }),
}))
