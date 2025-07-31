'use client'

import { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Users, Image as ImageIcon, MessageSquare, Zap } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: 50000,
    label: 'Active Users',
    suffix: '+',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ImageIcon,
    value: 2500000,
    label: 'Images Generated',
    suffix: '+',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: MessageSquare,
    value: 10000000,
    label: 'Chat Messages',
    suffix: '+',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: Zap,
    value: 99.9,
    label: 'Uptime',
    suffix: '%',
    color: 'from-orange-500 to-red-500'
  }
]

function AnimatedCounter({ 
  value, 
  duration = 2000,
  inView 
}: { 
  value: number
  duration?: number
  inView: boolean 
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setCount(Math.floor(easeOutQuart * value))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration, inView])

  return <span>{count.toLocaleString()}</span>
}

export function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 100
          }}
          className="text-center group"
        >
          <div className="card group-hover:scale-105 transition-transform duration-300">
            {/* Icon */}
            <div className="relative mb-4 mx-auto">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${stat.color} p-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className={`absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${stat.color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
            </div>

            {/* Value */}
            <div className="mb-2">
              <span className="text-3xl lg:text-4xl font-bold text-white">
                <AnimatedCounter value={stat.value} inView={isInView} />
                {stat.suffix}
              </span>
            </div>

            {/* Label */}
            <p className="text-gray-300 font-medium">{stat.label}</p>

            {/* Animated background */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}