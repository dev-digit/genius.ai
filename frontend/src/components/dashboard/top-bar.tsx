'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { 
  Search,
  Bell,
  User,
  Settings,
  Moon,
  Sun,
  Monitor,
  LogOut,
  ChevronDown
} from 'lucide-react'

export function TopBar() {
  const { user, logout } = useAuth()
  const { theme, setTheme, actualTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-dark-900/30 backdrop-blur-xl border-b border-white/10">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images, chats, or history..."
            className="input-primary pl-10 pr-4 py-2 w-full text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {actualTheme === 'dark' ? (
              <Moon className="w-5 h-5 text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-xl z-50"
              >
                <div className="p-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value as any)
                        setShowThemeMenu(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        theme === option.value
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            3
          </span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white hidden sm:block">
              {user?.username}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 glass rounded-xl shadow-xl z-50"
              >
                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {user?.full_name || user?.username}
                      </p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <hr className="my-2 border-white/10" />
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showThemeMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowThemeMenu(false)
          }}
        />
      )}
    </header>
  )
}