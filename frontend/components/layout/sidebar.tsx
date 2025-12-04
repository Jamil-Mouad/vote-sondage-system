"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ColorPicker } from "@/components/ui/color-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { BarChart3, Users, FileBarChart, History, User, HelpCircle, LogOut, X, Palette, Home } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, exact: true },
  { href: "/dashboard/groups", label: "Groupes", icon: Users },
  { href: "/dashboard/my-polls", label: "Mes Sondages", icon: FileBarChart },
  { href: "/dashboard/history", label: "Historique", icon: History },
  { href: "/dashboard/profile", label: "Profil", icon: User },
  { href: "/dashboard/help", label: "Aide & Support", icon: HelpCircle },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Overlay - visible quand le sidebar est ouvert avec effet de blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - toujours en position fixed, flotte au-dessus du contenu */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl",
          "transform transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button - visible sur toutes les tailles */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3" style={{ color: "var(--primary)" }}>
              <BarChart3 className="h-8 w-8" />
              <span className="text-xl font-bold">VotePoll</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 lg:pt-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Avatar
                className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background"
                style={{ ringColor: "var(--primary)" }}
              >
                <AvatarImage
                  src={user?.avatarUrl || "/placeholder.svg?height=48&width=48&query=avatar"}
                  alt={user?.username}
                />
                <AvatarFallback style={{ background: "var(--primary)", color: "white" }}>
                  {user?.username?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username || "Utilisateur"}
                </p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "hover:scale-105 hover:shadow-md active:scale-95",
                    isActive
                      ? "text-white font-medium shadow-lg"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, var(--primary), var(--primary-700))`,
                        }
                      : undefined
                  }
                >
                  <item.icon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <Separator />

          {/* Theme settings */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Palette className="h-4 w-4" />
                <span>Thème</span>
              </div>
              <ColorPicker />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mode</span>
              <ThemeToggle />
            </div>
          </div>

          <Separator />

          {/* Logout */}
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
