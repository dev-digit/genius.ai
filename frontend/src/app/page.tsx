'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Float, Text3D, Center } from '@react-three/drei'
import { AuthModal } from '@/components/auth/auth-modal'
import { Hero3D } from '@/components/3d/hero-3d'
import { FeatureCards } from '@/components/landing/feature-cards'
import { Stats } from '@/components/landing/stats'
import { 
  Sparkles, 
  MessageSquare, 
  Image as ImageIcon, 
  History, 
  Zap,
  Shield,
  Cpu,
  Palette
} from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  const handleGetStarted = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  const handleSignIn = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          className="three-canvas"
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1}
          />
          <Hero3D />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI Studio</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <button
              onClick={handleSignIn}
              className="btn-ghost text-sm"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="btn-primary text-sm"
            >
              Get Started
            </button>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 lg:px-8 py-20 lg:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-shadow-lg">
              Create with{' '}
              <span className="gradient-text">AI Power</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Professional AI Studio with cutting-edge image generation, 
              intelligent chatbot, and immersive 3D interface. 
              Unleash your creativity with unlimited possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="btn-primary text-lg px-8 py-4 animate-glow"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Creating
              </button>
              <button
                onClick={handleSignIn}
                className="btn-ghost text-lg px-8 py-4"
              >
                <Shield className="w-5 h-5 mr-2" />
                Sign In
              </button>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Everything You Need for{' '}
                <span className="gradient-text">AI Creation</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Professional-grade AI tools with an intuitive 3D interface, 
                designed for creators, developers, and innovators.
              </p>
            </div>

            <FeatureCards />
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Trusted by{' '}
                <span className="gradient-text">Creators Worldwide</span>
              </h2>
            </div>

            <Stats />
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="card bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500/30">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to Create Something Amazing?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of creators using AI Studio to bring their ideas to life. 
                Start your journey today with our powerful AI tools.
              </p>
              <button
                onClick={handleGetStarted}
                className="btn-primary text-lg px-8 py-4 animate-glow"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-12 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-md flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">AI Studio</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>© 2024 AI Studio. All rights reserved.</span>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}