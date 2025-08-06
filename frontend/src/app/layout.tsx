import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Studio - Advanced AI Image Generation & Chat',
  description: 'Professional AI Studio with 3D UI, Stable Diffusion XL image generation, and GPT-4o-mini chatbot',
  keywords: ['AI', 'Image Generation', 'Chatbot', 'Stable Diffusion', 'GPT-4', 'Three.js'],
  authors: [{ name: 'AI Studio Team' }],
  creator: 'AI Studio',
  publisher: 'AI Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ai-studio.vercel.app'),
  openGraph: {
    title: 'AI Studio - Advanced AI Tools',
    description: 'Professional AI Studio with 3D UI, Image Generation, and Chatbot',
    url: 'https://ai-studio.vercel.app',
    siteName: 'AI Studio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Studio Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Studio - Advanced AI Tools',
    description: 'Professional AI Studio with 3D UI, Image Generation, and Chatbot',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white antialiased">
        <Providers>
          <div className="flex min-h-screen">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}