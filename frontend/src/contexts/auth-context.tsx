'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { api } from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  full_name?: string
  created_at: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Verify token and get user info
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error: any) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/login', { email, password })
      
      const { access_token, user: userData } = response.data
      
      // Store token
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      setUser(userData)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/signup', {
        username,
        email,
        password,
        full_name: fullName,
      })
      
      const { access_token, user: userData } = response.data
      
      // Store token
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      setUser(userData)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Signup failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear token and user data
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    
    toast.success('Logged out successfully')
    router.push('/')
  }

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh')
      const { access_token } = response.data
      
      // Update token
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      refreshToken()
    }, 25 * 60 * 1000) // Refresh every 25 minutes (tokens expire in 30 minutes)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}