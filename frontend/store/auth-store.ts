import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role: "user" | "admin"
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false)
      },
    },
  ),
)
