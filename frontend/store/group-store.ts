import { create } from "zustand"

export interface Group {
  id: number
  name: string
  description?: string
  isPublic: boolean
  membersCount: number
  activePolls: number
  pendingRequests?: number
  membershipStatus: "none" | "pending" | "approved" | "rejected"
  myRole?: "member" | "admin"
  createdBy: {
    id: number
    username: string
  }
  createdAt: string
}

interface GroupState {
  groups: Group[]
  myGroups: { created: Group[]; joined: Group[] }
  currentGroup: Group | null
  isLoading: boolean
  setGroups: (groups: Group[]) => void
  setMyGroups: (myGroups: { created: Group[]; joined: Group[] }) => void
  setCurrentGroup: (group: Group | null) => void
  updateGroupMembership: (groupId: number, status: Group["membershipStatus"]) => void
  setLoading: (loading: boolean) => void
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  myGroups: { created: [], joined: [] },
  currentGroup: null,
  isLoading: false,
  setGroups: (groups) => set({ groups }),
  setMyGroups: (myGroups) => set({ myGroups }),
  setCurrentGroup: (currentGroup) => set({ currentGroup }),
  updateGroupMembership: (groupId, status) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === groupId ? { ...g, membershipStatus: status } : g)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
