"use client"

import type React from "react"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BarChart3, Vote, Users, TrendingUp } from "lucide-react"

const features = [
  { icon: Vote, text: "Votez facilement" },
  { icon: TrendingUp, text: "Résultats en temps réel" },
  { icon: Users, text: "Groupes privés" },
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-700)] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <BarChart3 className="h-10 w-10" />
            <span className="text-2xl font-bold">VoteApp</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-700)] to-transparent rounded-3xl" />
              <img
                src="/people-voting-with-tablets-and-floating-poll-bubbl.jpg"
                alt="Illustration de vote en ligne"
                className="w-full h-auto rounded-3xl"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white text-balance">
            Simplifiez vos décisions avec notre plateforme de vote en ligne
          </h2>
          <div className="flex flex-wrap gap-6">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-2 text-white/90">
                <div className="p-2 bg-white/20 rounded-lg">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <div className="flex justify-end p-6">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8" style={{ color: "var(--primary)" }}>
              <BarChart3 className="h-10 w-10" />
              <span className="text-2xl font-bold">VoteApp</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
