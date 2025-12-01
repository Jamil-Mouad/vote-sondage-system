import { create } from "zustand"

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
  totalVotes: number
  createdBy: {
    id: number
    username: string
    avatarUrl?: string
  }
  hasVoted: boolean
  myVote?: number
  isCreator: boolean
  createdAt: string
}

interface PollState {
  polls: Poll[]
  myPolls: Poll[]
  history: { active: Poll[]; ended: Poll[] }
  currentPoll: Poll | null
  isLoading: boolean
  setPolls: (polls: Poll[]) => void
  setMyPolls: (polls: Poll[]) => void
  setHistory: (history: { active: Poll[]; ended: Poll[] }) => void
  setCurrentPoll: (poll: Poll | null) => void
  updatePollVotes: (pollId: number, options: PollOption[], totalVotes: number) => void
  addVote: (pollId: number, optionIndex: number) => void
  setLoading: (loading: boolean) => void
}

export const usePollStore = create<PollState>((set) => ({
  polls: [],
  myPolls: [],
  history: { active: [], ended: [] },
  currentPoll: null,
  isLoading: false,
  setPolls: (polls) => set({ polls }),
  setMyPolls: (myPolls) => set({ myPolls }),
  setHistory: (history) => set({ history }),
  setCurrentPoll: (currentPoll) => set({ currentPoll }),
  updatePollVotes: (pollId, options, totalVotes) =>
    set((state) => ({
      polls: state.polls.map((p) => (p.id === pollId ? { ...p, options, totalVotes } : p)),
    })),
  addVote: (pollId, optionIndex) =>
    set((state) => ({
      polls: state.polls.map((p) => (p.id === pollId ? { ...p, hasVoted: true, myVote: optionIndex } : p)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
