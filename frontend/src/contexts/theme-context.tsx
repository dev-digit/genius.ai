'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark')

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Default to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setThemeState(systemTheme)
    }
  }, [])

  // Update actual theme based on theme setting
  useEffect(() => {
    let newActualTheme: 'dark' | 'light'

    if (theme === 'system') {
      newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      newActualTheme = theme
    }

    setActualTheme(newActualTheme)

    // Update document class
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(newActualTheme)

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newActualTheme === 'dark' ? '#0f172a' : '#f8fafc')
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newActualTheme = mediaQuery.matches ? 'dark' : 'light'
      setActualTheme(newActualTheme)
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(newActualTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}