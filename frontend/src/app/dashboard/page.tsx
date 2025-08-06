'use client'

import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { userAPI, historyAPI } from '@/lib/api'
import { 
  Image as ImageIcon, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Clock,
  Zap,
  Users,
  Activity
} from 'lucide-react'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { WelcomeCard } from '@/components/dashboard/welcome-card'

export default function DashboardPage() {
  const { data: usageStats, isLoading: statsLoading } = useQuery(
    'usage-stats',
    userAPI.getUsageStats,
    {
      select: (response) => response.data,
    }
  )

  const { data: historyStats } = useQuery(
    'history-stats',
    historyAPI.getStats,
    {
      select: (response) => response.data,
    }
  )

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WelcomeCard />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <QuickActions />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StatsCards stats={usageStats} historyStats={historyStats} loading={statsLoading} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <RecentActivity />
      </motion.div>
    </div>
  )
}