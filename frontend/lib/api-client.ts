// API Client pour la communication avec le backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Fonction pour récupérer le token depuis auth-storage (Zustand persist)
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  
  try {
    // D'abord essayer de récupérer depuis le store Zustand persisté
    const authStorage = localStorage.getItem("auth-storage")
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      if (parsed.state?.token) {
        return parsed.state.token
      }
    }
    
    // Fallback: essayer l'ancienne clé accessToken (pour compatibilité)
    const legacyToken = localStorage.getItem("accessToken")
    if (legacyToken) {
      return legacyToken
    }
  } catch (e) {
    console.error("Error reading auth token:", e)
  }
  
  return null
}

// Fonction utilitaire pour gérer les appels API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T; success: boolean; message?: string }> {
  const url = `${API_BASE_URL}${endpoint}`

  // Récupérer le token d'authentification
  const token = getAuthToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const result = await response.json()

    if (!response.ok) {
      // Le backend renvoie les erreurs dans result.error.message ou result.error.details
      const errorMessage = result.error?.message || result.message || "Une erreur est survenue"
      const errorDetails = result.error?.details

      // Si on a des détails de validation, on les affiche
      if (errorDetails && Array.isArray(errorDetails)) {
        const validationErrors = errorDetails.map((err: any) => err.msg).join(", ")
        throw new Error(validationErrors)
      }

      throw new Error(errorMessage)
    }

    return {
      data: result.data,
      success: result.success ?? true,
      message: result.message,
    }
  } catch (error) {
    console.error("API Request Error:", error)
    throw error instanceof Error
      ? error
      : new Error("Une erreur réseau est survenue")
  }
}

// API d'authentification
export const realAuthApi = {
  async register(data: { username: string; email: string; password: string }) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async verifyEmail(data: { email: string; code: string }) {
    console.log("Frontend sending verification:", {
      email: data.email,
      code: data.code,
      codeType: typeof data.code,
      codeLength: data.code.length,
    })

    const result = await apiRequest<{
      userId: number
      email: string
      username: string
      accessToken: string
      refreshToken: string
    }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    })

    // Sauvegarder les tokens
    if (typeof window !== "undefined" && result.data) {
      localStorage.setItem("accessToken", result.data.accessToken)
      localStorage.setItem("refreshToken", result.data.refreshToken)
      localStorage.setItem("userId", result.data.userId.toString())
    }

    // Retourner dans le format attendu (compatible avec mock)
    return {
      user: {
        id: result.data.userId,
        username: result.data.username,
        email: result.data.email,
        role: "user" as const,
        createdAt: new Date().toISOString(),
      },
      accessToken: result.data.accessToken,
    }
  },

  async resendCode(email: string) {
    return apiRequest("/auth/resend-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  async login(data: { email: string; password: string }) {
    const result = await apiRequest<{
      userId: number
      email: string
      username: string
      accessToken: string
      refreshToken: string
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })

    // Sauvegarder les tokens
    if (typeof window !== "undefined" && result.data) {
      localStorage.setItem("accessToken", result.data.accessToken)
      localStorage.setItem("refreshToken", result.data.refreshToken)
      localStorage.setItem("userId", result.data.userId.toString())
    }

    // Retourner dans le format attendu (compatible avec mock)
    return {
      user: {
        id: result.data.userId,
        username: result.data.username,
        email: result.data.email,
        role: "user" as const,
        createdAt: new Date().toISOString(),
      },
      accessToken: result.data.accessToken,
    }
  },

  async forgotPassword(email: string) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(data: {
    email: string
    code: string
    newPassword: string
  }) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async refreshToken() {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null

    if (!refreshToken) {
      throw new Error("Aucun refresh token disponible")
    }

    const result = await apiRequest<{
      accessToken: string
      refreshToken: string
    }>("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })

    // Mettre à jour les tokens
    if (typeof window !== "undefined" && result.data) {
      localStorage.setItem("accessToken", result.data.accessToken)
      localStorage.setItem("refreshToken", result.data.refreshToken)
    }

    return result
  },

  async logout() {
    const result = await apiRequest("/auth/logout", {
      method: "POST",
    })

    // Supprimer les tokens
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
    }

    return result
  },
}

export { apiRequest }
