"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bell, BarChart2, Users, CheckCircle, Trash2, Check,
  ExternalLink, Loader2, Clock, Calendar, Info,
  AlertCircle, ShieldCheck, UserPlus, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotificationStore, Notification } from "@/store/notification-store"
import { formatDistanceToNow, isToday, isYesterday, startOfWeek, isAfter } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore()

  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = notifications.filter(n => filter === "all" || !n.isRead)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Grouping notifications by date
  const groupNotifications = (notifs: Notification[]) => {
    const today: Notification[] = []
    const yesterday: Notification[] = []
    const thisWeek: Notification[] = []
    const older: Notification[] = []

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })

    notifs.forEach(n => {
      const d = new Date(n.createdAt)
      if (isToday(d)) today.push(n)
      else if (isYesterday(d)) yesterday.push(n)
      else if (isAfter(d, weekStart)) thisWeek.push(n)
      else older.push(n)
    })

    return { today, yesterday, thisWeek, older }
  }

  const groups = groupNotifications(filteredNotifications)

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case "poll":
      case "poll_ended":
        return { icon: BarChart2, color: "text-blue-500", bg: "bg-blue-500/10", label: "Sondage" }
      case "group_request":
        return { icon: UserPlus, color: "text-amber-500", bg: "bg-amber-500/10", label: "Demande" }
      case "join_approved":
        return { icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10", label: "Accepté" }
      case "join_rejected":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Refusé" }
      case "result":
        return { icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-500/10", label: "Résultat" }
      default:
        return { icon: Bell, color: "text-primary", bg: "bg-primary/10", label: "Info" }
    }
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const config = getNotificationConfig(notification.type)
    const Icon = config.icon

    return (
      <div
        className={cn(
          "group relative flex items-start gap-4 p-5 transition-all hover:bg-muted/40 cursor-pointer overflow-hidden",
          !notification.isRead && "bg-primary/5"
        )}
        onClick={() => {
          if (!notification.isRead) markAsRead(notification.id)
        }}
      >
        {/* Unread Indicator Dot */}
        {!notification.isRead && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        )}

        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110", config.bg, config.color)}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className={cn("font-bold text-base leading-tight truncate", !notification.isRead ? "text-foreground" : "text-muted-foreground/80")}>
              {notification.title}
            </h3>
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>

          <p className={cn("text-sm leading-relaxed line-clamp-2", !notification.isRead ? "text-muted-foreground" : "text-muted-foreground/60")}>
            {notification.message}
          </p>

          {notification.link && (
            <Link
              href={notification.link}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary hover:text-primary-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                if (!notification.isRead) markAsRead(notification.id)
              }}
            >
              Voir les détails
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
          {!notification.isRead && (
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all transform hover:rotate-12"
              onClick={(e) => {
                e.stopPropagation()
                markAsRead(notification.id)
              }}
            >
              <Check className="h-5 w-5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all transform hover:-rotate-12"
            onClick={(e) => {
              e.stopPropagation()
              deleteNotification(notification.id)
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  const RenderSection = ({ title, notifs }: { title: string, notifs: Notification[] }) => {
    if (notifs.length === 0) return null
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-5 flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {title}
        </h4>
        <div className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 overflow-hidden divide-y divide-border/20 shadow-xl">
          {notifs.map(n => <NotificationItem key={n.id} notification={n} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 animate-in fade-in duration-1000">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/10 shadow-2xl p-8 lg:p-12">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-tight">
                Votre <span className="text-primary">Boîte de Réception</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto lg:mx-0">
                {unreadCount > 0
                  ? `Vous avez ${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""} notification${unreadCount > 1 ? "s" : ""} à consulter.`
                  : "Vous êtes à jour ! Aucune nouvelle notification pour le moment."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  className="rounded-2xl h-11 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-700))' }}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Tout marquer comme lu
                </Button>
              )}

              <div className="flex bg-muted/50 p-1 rounded-2xl border border-border/50">
                <button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    filter === "all" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    filter === "unread" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Non Lues
                </button>
              </div>
            </div>
          </div>

          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] group-hover:blur-[100px] transition-all opacity-50" />
            <img
              src="/notification-icon-public.png"
              alt="Notifications"
              className="relative z-10 w-48 h-48 lg:w-64 lg:h-64 object-contain animate-float drop-shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)]"
            />
          </div>
        </div>
      </section>

      {/* Main Content Flux */}
      <div className="space-y-12">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="h-16 w-16 animate-spin text-primary/20 mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">Synchronisation...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in zoom-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-muted rounded-full blur-3xl opacity-50 scale-150" />
              <img
                src="/notification-icon-public.png"
                alt="Empty"
                className="relative z-10 w-48 h-48 object-contain opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-foreground/80">Tout est calme ici</h3>
              <p className="text-muted-foreground max-w-xs font-medium">
                {filter === "unread"
                  ? "Bravo ! Vous avez lu toutes vos notifications."
                  : "Vous n'avez pas encore reçu de notifications."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-10">
            <RenderSection title="Aujourd'hui" notifs={groups.today} />
            <RenderSection title="Hier" notifs={groups.yesterday} />
            <RenderSection title="Cette semaine" notifs={groups.thisWeek} />
            <RenderSection title="Plus ancien" notifs={groups.older} />
          </div>
        )}
      </div>
    </div>
  )
}

