'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Sparkles, TrendingUp, Clock } from 'lucide-react'

export function WelcomeCard() {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="card bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 border-primary-500/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {getGreeting()}, {user?.full_name || user?.username}! 👋
            </h1>
            <p className="text-gray-300 text-lg">
              Ready to create something amazing today?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-6 mt-6"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>Account active since {new Date(user?.created_at || '').toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Last login: Today</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:block"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center animate-float">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}