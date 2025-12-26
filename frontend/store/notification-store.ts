import { create } from "zustand"
import { apiRequest } from "@/lib/api-client"

export interface Notification {
    id: number
    userId: number
    title: string
    message: string
    type: string
    link?: string
    isRead: boolean
    createdAt: string
}

interface NotificationState {
    notifications: Notification[]
    isLoading: boolean
    error: string | null

    // Actions
    fetchNotifications: () => Promise<void>
    markAsRead: (id: number) => Promise<boolean>
    markAllAsRead: () => Promise<boolean>
    deleteNotification: (id: number) => Promise<boolean>
    setLoading: (loading: boolean) => void
    clearError: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await apiRequest<any[]>("/notifications")
            if (response.success) {
                // Map backend snake_case to frontend camelCase
                const mapped = (response.data || []).map((n: any) => ({
                    id: n.id,
                    userId: n.user_id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    link: n.link,
                    isRead: !!n.is_read,
                    createdAt: n.created_at
                }))
                set({ notifications: mapped, isLoading: false })
            } else {
                set({ error: response.message || "Erreur lors du chargement des notifications", isLoading: false })
            }
        } catch (error: any) {
            set({ error: error.message || "Erreur réseau", isLoading: false })
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await apiRequest(`/notifications/${id}/read`, { method: "PUT" })
            if (response.success) {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, isRead: true } : n
                    )
                }))
                return true
            }
            return false
        } catch (error) {
            return false
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await apiRequest("/notifications/mark-all-read", { method: "PUT" })
            if (response.success) {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
                }))
                return true
            }
            return false
        } catch (error) {
            return false
        }
    },

    deleteNotification: async (id) => {
        try {
            const response = await apiRequest(`/notifications/${id}`, { method: "DELETE" })
            if (response.success) {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id)
                }))
                return true
            }
            return false
        } catch (error) {
            return false
        }
    },

    setLoading: (loading) => set({ isLoading: loading }),
    clearError: () => set({ error: null }),
}))
