import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        toast.error('Session expired. Please login again.')
        window.location.href = '/'
      }
    } else if (response?.status === 403) {
      toast.error('Access denied')
    } else if (response?.status === 404) {
      toast.error('Resource not found')
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.')
    } else if (!response) {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  signup: (data: {
    username: string
    email: string
    password: string
    full_name?: string
  }) => api.post('/auth/signup', data),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
  
  refresh: () => api.post('/auth/refresh'),
}

export const chatAPI = {
  sendMessage: (data: {
    message: string
    session_id?: string
    system_prompt?: string
    max_tokens?: number
    temperature?: number
    stream?: boolean
  }) => api.post('/chat', data),
  
  getSessions: () => api.get('/chat/sessions'),
  
  getSession: (sessionId: string) => api.get(`/chat/sessions/${sessionId}`),
  
  deleteSession: (sessionId: string) => api.delete(`/chat/sessions/${sessionId}`),
  
  // Stream endpoint
  getStreamUrl: () => `${API_BASE_URL}/chat/stream`,
}

export const imageAPI = {
  generateImage: (data: {
    prompt: string
    negative_prompt?: string
    style?: string
    size?: string
    steps?: number
    guidance_scale?: number
    seed?: number
    num_images?: number
    model_version?: string
  }) => api.post('/generate/image', data),
  
  getGenerationStatus: (generationId: string) =>
    api.get(`/generate/image/${generationId}/status`),
  
  getModels: () => api.get('/generate/models'),
  
  getStyles: () => api.get('/generate/styles'),
  
  cancelGeneration: (generationId: string) =>
    api.delete(`/generate/image/${generationId}`),
  
  // Stream endpoint
  getStreamUrl: (generationId: string) =>
    `${API_BASE_URL}/generate/image/${generationId}/stream`,
}

export const historyAPI = {
  getHistory: (params?: {
    type?: 'chat' | 'image'
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }) => api.get('/history', { params }),
  
  getChatHistory: (params?: {
    limit?: number
    offset?: number
    session_id?: string
  }) => api.get('/history/chat', { params }),
  
  getImageHistory: (params?: {
    limit?: number
    offset?: number
    favorites_only?: boolean
  }) => api.get('/history/images', { params }),
  
  toggleImageFavorite: (imageId: string) =>
    api.post(`/history/images/${imageId}/favorite`),
  
  deleteImage: (imageId: string) =>
    api.delete(`/history/images/${imageId}`),
  
  deleteChatSession: (sessionId: string) =>
    api.delete(`/history/chat/${sessionId}`),
  
  clearHistory: (type?: 'chat' | 'image') =>
    api.delete('/history/clear', { params: { type } }),
  
  getStats: () => api.get('/history/stats'),
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (data: { full_name?: string }) =>
    api.put('/user/profile', data),
  
  getSettings: () => api.get('/user/settings'),
  
  updateSettings: (settings: {
    theme?: string
    default_image_style?: string
    default_image_size?: string
    chat_model?: string
    auto_save_history?: boolean
    notifications_enabled?: boolean
  }) => api.put('/user/settings', settings),
  
  changePassword: (data: {
    current_password: string
    new_password: string
  }) => api.post('/user/change-password', data),
  
  getUsageStats: () => api.get('/user/usage-stats'),
  
  exportData: () => api.post('/user/export-data'),
  
  deactivateAccount: () => api.delete('/user/deactivate'),
}

export default api