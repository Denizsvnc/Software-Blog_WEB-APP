import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../api/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (u: User) => void
  rememberMe: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true'
  })

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const storedRememberMe = localStorage.getItem('rememberMe') === 'true'
      setRememberMe(storedRememberMe)
      
      if (token) {
        try {
          const response = await api.get('/auth/me')
          const userData = response.data
          setUser(userData)
          // User data'sını cache et (sensitive olmayan bilgiler)
          localStorage.setItem('cachedUser', JSON.stringify(userData))
        } catch (error) {
          console.error('Auth check failed:', error)
          // Token invalid veya expired
          localStorage.removeItem('token')
          localStorage.removeItem('rememberMe')
          localStorage.removeItem('cachedUser')
          setUser(null)
          setRememberMe(false)
        }
      } else {
        // Token yoksa cached user'ı temizle
        localStorage.removeItem('cachedUser')
        setUser(null)
      }
      setLoading(false)
    }
    checkAuth()

    // Token expired event listener
    const handleTokenExpired = () => {
      setUser(null)
      setRememberMe(false)
      localStorage.removeItem('cachedUser')
    }

    window.addEventListener('tokenExpired', handleTokenExpired)
    return () => window.removeEventListener('tokenExpired', handleTokenExpired)
  }, [])

  const login = async (email: string, password: string, rememberMeFlag = false) => {
    const response = await api.post('/auth/login', { email, password })
    const { token, user } = response.data
    localStorage.setItem('token', token)
    
    if (rememberMeFlag) {
      localStorage.setItem('rememberMe', 'true')
      setRememberMe(true)
    } else {
      localStorage.removeItem('rememberMe')
      setRememberMe(false)
    }
    
    // User data'sını cache et
    localStorage.setItem('cachedUser', JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('cachedUser')
    setUser(null)
    setRememberMe(false)
  }

  const updateUser = (u: User) => {
    setUser(u)
    localStorage.setItem('cachedUser', JSON.stringify(u))
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
    rememberMe
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
