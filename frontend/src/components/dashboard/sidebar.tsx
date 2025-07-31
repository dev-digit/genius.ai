'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { 
  Home,
  Image as ImageIcon,
  MessageSquare,
  History,
  Settings,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'

const menuItems = [
  {
    icon: Home,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: ImageIcon,
    label: 'Image Generator',
    href: '/dashboard/image-generator',
  },
  {
    icon: MessageSquare,
    label: 'AI Chatbot',
    href: '/dashboard/chat',
  },
  {
    icon: History,
    label: 'History',
    href: '/dashboard/history',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/settings',
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`relative flex flex-col bg-dark-900/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">AI Studio</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 text-white'
                  : 'hover:bg-white/5 text-gray-300 hover:text-white'
              }`}
            >
              <item.icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-white'
                }`} 
              />
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-2 w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className={`flex items-center space-x-3 p-3 rounded-xl bg-white/5 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full mt-2 flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all duration-200 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4" />
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  )
}