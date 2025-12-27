"use client"

import type React from "react"
import { useThemeStore } from "@/store/theme-store"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BarChart3 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, accentColor } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const getIllustrationSrc = () => {
    if (theme === "light") return "/login-icon-light-mode-public.png"

    switch (accentColor) {
      case "blue": return "/login-icon-dark-bleu.png"
      case "green": return "/login-icon-dark-vert.png"
      case "gold": return "/login-icon-dark-orange.png"
      case "purple": return "/login-icon-dark-violet.png"
      case "red": return "/login-icon-dark-gold.png" // red is mapped to gold as per design
      case "pink": return "/login-icon-dark-pink.png"
      default: return "/login-icon-dark-mode-public.png"
    }
  }

  const illustrationSrc = getIllustrationSrc()

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center transition-colors duration-500">
      {/* Dynamic Background Gradient */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(135deg, var(--primary-700) 0%, var(--primary-500) 50%, var(--primary-100) 100%)`,
          opacity: 0.8
        }}
      />

      {/* Subtle animated blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-700/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-6xl h-[min(800px,95vh)] mx-4 flex items-stretch rounded-[2.5rem] overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-3xl border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">

        {/* Left Section - Form */}
        <div className="flex-1 flex flex-col p-8 sm:p-14 relative overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-8 absolute top-8 left-8 sm:left-14">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">VotePoll</span>
          </div>

          <div className="flex-1 flex flex-col justify-center pt-8">
            {children}
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="hidden lg:flex w-[50%] relative overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className={cn(
              "relative w-full h-full transform group-hover:scale-105 transition-transform duration-1000 ease-out animate-float",
              "scale-110"
            )}>
              <Image
                src={illustrationSrc}
                alt="Illustration"
                fill
                className={cn(
                  "object-contain transition-all duration-700",
                  theme === "light" && "translate-y-[12px] -translate-x-[12px]"
                )}
                style={{
                  filter: `drop-shadow(0 15px 30px var(--primary))`
                }}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
