'use client'

import { motion } from 'framer-motion'
import { 
  Image as ImageIcon, 
  MessageSquare, 
  History, 
  Palette,
  Cpu,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

const features = [
  {
    icon: ImageIcon,
    title: 'AI Image Generation',
    description: 'Create stunning images with Stable Diffusion XL. Advanced controls, multiple styles, and unlimited creativity.',
    color: 'from-blue-500 to-cyan-500',
    highlights: ['Stable Diffusion XL', 'Multiple Styles', 'High Resolution', 'No Restrictions']
  },
  {
    icon: MessageSquare,
    title: 'Intelligent Chatbot',
    description: 'Powered by GPT-4o-mini with streaming responses, memory, and context awareness for natural conversations.',
    color: 'from-purple-500 to-pink-500',
    highlights: ['GPT-4o-mini', 'Streaming', 'Memory', 'Context Aware']
  },
  {
    icon: Palette,
    title: '3D Interactive UI',
    description: 'Immersive Three.js interface with smooth animations, responsive design, and modern aesthetics.',
    color: 'from-green-500 to-teal-500',
    highlights: ['Three.js', 'Smooth Animations', 'Responsive', 'Modern Design']
  },
  {
    icon: History,
    title: 'Complete History',
    description: 'Track all your creations, chat sessions, and favorite images with powerful search and organization.',
    color: 'from-orange-500 to-red-500',
    highlights: ['Full History', 'Search', 'Favorites', 'Organization']
  },
  {
    icon: Cpu,
    title: 'High Performance',
    description: 'Optimized for speed with smart caching, background processing, and real-time progress tracking.',
    color: 'from-indigo-500 to-blue-500',
    highlights: ['Smart Caching', 'Background Processing', 'Real-time', 'Optimized']
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'JWT authentication, encrypted data, and privacy-first approach. Your creations stay yours.',
    color: 'from-emerald-500 to-green-500',
    highlights: ['JWT Auth', 'Encrypted', 'Privacy First', 'Secure']
  }
]

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group"
        >
          <div className="card-hover h-full">
            {/* Icon and gradient background */}
            <div className="relative mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
              {feature.title}
            </h3>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {feature.description}
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2">
              {feature.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="px-3 py-1 text-xs bg-white/10 text-gray-200 rounded-full border border-white/20 group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-300"
                >
                  {highlight}
                </span>
              ))}
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}