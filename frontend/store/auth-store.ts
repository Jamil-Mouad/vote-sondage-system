import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  bio?: string
  firstName?: string
  lastName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  setUser: (user: User) => void
  fetchProfile: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Login failed')
        }
        
        const userData = result.data
        set({ 
          user: {
            id: userData.userId,
            name: userData.username,
            email: userData.email,
          }, 
          token: userData.accessToken, 
          isAuthenticated: true 
        })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      setUser: (user: User) => {
        set({ user })
      },

      fetchProfile: async () => {
        const token = get().token
        if (!token) return

        set({ isLoading: true })
        try {
          const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch profile')
          }

          const data = await response.json()
          const userData = data.data.user
          set({ 
            user: {
              id: userData.id,
              name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
              email: userData.email,
              avatar: userData.avatarUrl,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              bio: userData.bio,
            }
          })
        } catch (error) {
          console.error('Fetch profile error:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const token = get().token
        if (!token) throw new Error('Not authenticated')

        const formData = new FormData()
        if (data.name) {
          const nameParts = data.name.split(' ')
          formData.append('firstName', nameParts[0] || '')
          formData.append('lastName', nameParts.slice(1).join(' ') || '')
        }
        if (data.firstName) formData.append('firstName', data.firstName)
        if (data.lastName) formData.append('lastName', data.lastName)
        if (data.phone !== undefined) formData.append('phone', data.phone || '')
        if (data.bio !== undefined) formData.append('bio', data.bio || '')

        const response = await fetch(`${API_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Update failed')
        }

        const result = await response.json()
        const updatedUser = result.data.user
        
        set({ 
          user: {
            ...get().user,
            id: updatedUser.id,
            name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.username,
            email: updatedUser.email,
            avatar: updatedUser.avatarUrl,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
          } as User
        })
      },

      uploadAvatar: async (file: File) => {
        const token = get().token
        if (!token) throw new Error('Not authenticated')

        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch(`${API_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Upload failed')
        }

        const result = await response.json()
        const avatarUrl = result.data.user.avatarUrl
        
        set({ 
          user: { 
            ...get().user, 
            avatar: avatarUrl 
          } as User 
        })
        
        return avatarUrl
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const token = get().token
        if (!token) throw new Error('Not authenticated')

        const response = await fetch(`${API_URL}/users/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Password change failed')
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
