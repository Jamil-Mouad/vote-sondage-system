import { mockPolls, mockGroups, mockUsers } from "./mock-data"
import { realAuthApi } from "./api-client"
import type { User } from "@/store/auth-store"
import type { Poll } from "@/store/poll-store"
import type { Group } from "@/store/group-store"

// Mode API: "mock" ou "real"
const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock"
const USE_REAL_API = API_MODE === "real"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory storage for demo
const polls = [...mockPolls]
const groups = [...mockGroups]
let pendingUsers: { email: string; username: string; password: string; code: string; expiresAt: Date }[] = []
const users = [...mockUsers]

// Mock Auth API
const mockAuthApi = {
  async register(data: { username: string; email: string; password: string }) {
    await delay(800)

    if (users.find((u) => u.email === data.email)) {
      throw new Error("Cet email est déjà utilisé")
    }
    if (users.find((u) => u.username === data.username)) {
      throw new Error("Ce nom d'utilisateur est déjà pris")
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    pendingUsers.push({
      email: data.email,
      username: data.username,
      password: data.password,
      code,
      expiresAt,
    })

    console.log(`[DEMO] Code de vérification pour ${data.email}: ${code}`)

    return { email: data.email, expiresIn: "10 minutes" }
  },

  async verifyEmail(data: { email: string; code: string }) {
    await delay(500)

    const pending = pendingUsers.find((p) => p.email === data.email)
    if (!pending) {
      throw new Error("Aucune inscription en attente pour cet email")
    }
    if (pending.code !== data.code) {
      throw new Error("Code de vérification incorrect")
    }
    if (new Date() > pending.expiresAt) {
      throw new Error("Le code a expiré")
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      username: pending.username,
      name: pending.username, // Using username as name for mock
      email: pending.email,
    }

    users.push(newUser)
    pendingUsers = pendingUsers.filter((p) => p.email !== data.email)

    return {
      user: newUser,
      accessToken: "mock-jwt-token-" + newUser.id,
    }
  },

  async resendCode(email: string) {
    await delay(500)

    const pending = pendingUsers.find((p) => p.email === email)
    if (!pending) {
      throw new Error("Aucune inscription en attente pour cet email")
    }

    pending.code = Math.floor(100000 + Math.random() * 900000).toString()
    pending.expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    console.log(`[DEMO] Nouveau code pour ${email}: ${pending.code}`)

    return { success: true }
  },

  async login(data: { email: string; password: string; rememberMe?: boolean }) {
    await delay(800)

    const user = users.find((u) => u.email === data.email)
    if (!user) {
      throw new Error("Email ou mot de passe incorrect")
    }

    return {
      user,
      accessToken: "mock-jwt-token-" + user.id,
    }
  },

  async forgotPassword(email: string) {
    await delay(500)

    const user = users.find((u) => u.email === email)
    if (!user) {
      throw new Error("Aucun compte associé à cet email")
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`[DEMO] Code de réinitialisation pour ${email}: ${code}`)

    return { expiresIn: "10 minutes" }
  },

  async resetPassword(data: { email: string; code: string; newPassword: string }) {
    await delay(500)
    // In demo mode, accept any 6-digit code
    if (data.code.length !== 6) {
      throw new Error("Code invalide")
    }
    return { success: true }
  },

  async updateProfile(data: Partial<User>) {
    await delay(500)
    const userIndex = users.findIndex((u) => u.id === data.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data }
      return users[userIndex]
    }
    throw new Error("Utilisateur non trouvé")
  },
}

// Export authApi selon le mode
export const authApi = USE_REAL_API ? realAuthApi : mockAuthApi

// Polls API
export const pollsApi = {
  async getPublicPolls(status: "active" | "ended" | "all" = "active") {
    await delay(500)
    let result = polls.filter((p) => p.isPublic)
    if (status !== "all") {
      result = result.filter((p) => p.status === status)
    }
    return result
  },

  async getPoll(id: number) {
    await delay(300)
    const poll = polls.find((p) => p.id === id)
    if (!poll) throw new Error("Sondage non trouvé")
    return poll
  },

  async createPoll(data: {
    question: string
    description?: string
    options: string[]
    endTime: string
    isPublic: boolean
    groupId?: number
  }) {
    await delay(500)

    const newPoll: Poll = {
      id: polls.length + 1,
      question: data.question,
      description: data.description,
      options: data.options.map((text, i) => ({
        index: i + 1,
        text,
        votes: 0,
        percentage: 0,
      })),
      endTime: data.endTime,
      status: "active",
      isPublic: data.isPublic,
      groupId: data.groupId,
      totalVotes: 0,
      createdBy: 1,
      creatorName: "johndoe",
      hasVoted: false,
      isCreator: true,
      pollType: "poll",
      showResultsOnVote: true,
      createdAt: new Date().toISOString(),
    }

    polls.unshift(newPoll)
    return newPoll
  },

  async vote(pollId: number, optionSelected: number) {
    await delay(300)

    const poll = polls.find((p) => p.id === pollId)
    if (!poll) throw new Error("Sondage non trouvé")
    if (poll.hasVoted) throw new Error("Vous avez déjà voté")
    if (poll.isCreator) throw new Error("Vous ne pouvez pas voter sur votre propre sondage")
    if (poll.status === "ended") throw new Error("Le sondage est terminé")

    poll.hasVoted = true
    poll.myVote = optionSelected
    poll.totalVotes += 1
    poll.options[optionSelected - 1].votes += 1

    // Recalculate percentages
    poll.options.forEach((opt) => {
      opt.percentage = Math.round((opt.votes / poll.totalVotes) * 100)
    })

    return poll
  },

  async getMyPolls() {
    await delay(500)
    return polls.filter((p) => p.isCreator)
  },

  async getHistory() {
    await delay(500)
    return {
      active: polls.filter((p) => p.hasVoted && p.status === "active"),
      ended: polls.filter((p) => p.hasVoted && p.status === "ended"),
    }
  },

  async deletePoll(id: number) {
    await delay(300)
    const index = polls.findIndex((p) => p.id === id)
    if (index !== -1) {
      polls[index].status = "cancelled"
    }
    return { success: true }
  },
}

// Groups API
export const groupsApi = {
  async getPublicGroups() {
    await delay(500)
    return groups.filter((g) => g.isPublic)
  },

  async getGroup(id: number) {
    await delay(300)
    const group = groups.find((g) => g.id === id)
    if (!group) throw new Error("Groupe non trouvé")
    return group
  },

  async createGroup(data: { name: string; description?: string; isPublic: boolean }) {
    await delay(500)

    const newGroup: Group = {
      id: groups.length + 1,
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      membersCount: 1,
      activePollsCount: 0,
      pendingRequests: 0,
      membershipStatus: "approved",
      myRole: "admin",
      createdBy: 1,
      createdAt: new Date().toISOString(),
    }

    groups.unshift(newGroup)
    return newGroup
  },

  async joinGroup(id: number) {
    await delay(300)
    const group = groups.find((g) => g.id === id)
    if (!group) throw new Error("Groupe non trouvé")
    group.membershipStatus = "pending"
    return { status: "pending" }
  },

  async leaveGroup(id: number) {
    await delay(300)
    const group = groups.find((g) => g.id === id)
    if (!group) throw new Error("Groupe non trouvé")
    group.membershipStatus = "none"
    group.membersCount -= 1
    return { success: true }
  },

  async getMyGroups() {
    await delay(500)
    return {
      created: groups.filter((g) => g.myRole === "admin"),
      joined: groups.filter((g) => g.membershipStatus === "approved" && g.myRole === "member"),
    }
  },

  async getGroupPolls(groupId: number) {
    await delay(300)
    return polls.filter((p) => p.groupId === groupId)
  },

  async approveMemberRequest(groupId: number, userId: number) {
    await delay(300)
    const group = groups.find((g) => g.id === groupId)
    if (!group) throw new Error("Groupe non trouvé")
    if (group.pendingRequests && group.pendingRequests > 0) {
      group.pendingRequests -= 1
      group.membersCount += 1
    }
    return { success: true }
  },

  async rejectMemberRequest(groupId: number, userId: number) {
    await delay(300)
    const group = groups.find((g) => g.id === groupId)
    if (!group) throw new Error("Groupe non trouvé")
    if (group.pendingRequests && group.pendingRequests > 0) {
      group.pendingRequests -= 1
    }
    return { success: true }
  },

  async getPendingRequests(groupId: number) {
    await delay(300)
    const group = groups.find((g) => g.id === groupId)
    if (!group) throw new Error("Groupe non trouvé")
    // Retourner des demandes mockées pour la démo
    if (group.myRole === "admin" && group.pendingRequests) {
      return Array.from({ length: group.pendingRequests }, (_, i) => ({
        id: i + 1,
        user: {
          id: 100 + i,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
        },
        createdAt: new Date().toISOString(),
      }))
    }
    return []
  },
}

// Support API
export const supportApi = {
  async sendMessage(data: { subject: string; message: string }) {
    await delay(500)
    console.log("[DEMO] Message de support envoyé:", data)
    return { success: true }
  },
}
