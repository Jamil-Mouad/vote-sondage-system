"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Menu, Search, Bell, User, Settings, LogOut, Vote, Users, CheckCircle } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

const mockNotifications = [
  {
    id: 1,
    type: "vote",
    title: 'Nouveau vote sur "Quel framework..."',
    description: "125 → 126 votes",
    time: "Il y a 2min",
    read: false,
  },
  {
    id: 2,
    type: "ended",
    title: 'Sondage terminé : "Meilleur langage"',
    description: "Résultat : Node.js (42%)",
    time: "Il y a 1h",
    read: false,
  },
  {
    id: 3,
    type: "group",
    title: "Demande acceptée : Club de Lecture",
    description: "Vous êtes maintenant membre",
    time: "Il y a 3h",
    read: true,
  },
]

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const unreadCount = mockNotifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "vote":
        return <Vote className="h-4 w-4" style={{ color: "var(--primary)" }} />
      case "ended":
        return <CheckCircle className="h-4 w-4 text-red-500" />
      case "group":
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Bouton hamburger - toujours visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-primary/10 transition-all"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard" className="hidden lg:flex items-center gap-2" style={{ color: "var(--primary)" }}>
            <BarChart3 className="h-8 w-8" />
            <span className="text-xl font-bold">VotePoll</span>
          </Link>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex relative w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Mobile logo */}
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2" style={{ color: "var(--primary)" }}>
          <BarChart3 className="h-7 w-7" />
          <span className="text-lg font-bold">VotePoll</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search button for mobile */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    style={{ background: "var(--primary)" }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  Tout marquer lu
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme toggle - Hidden on mobile (in sidebar) */}
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.avatar ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}` : undefined} 
                    alt={user?.name} 
                  />
                  <AvatarFallback style={{ background: "var(--primary)", color: "white" }}>
                    {user?.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/help">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
