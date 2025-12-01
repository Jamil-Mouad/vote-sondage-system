"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, BarChart3, Users, CheckCircle, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "poll" | "group" | "result"
  title: string
  description: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "poll",
    title: "Nouveau sondage disponible",
    description: "Un nouveau sondage 'Choix du restaurant' a été créé dans le groupe Tech Team",
    time: "Il y a 5 min",
    read: false,
  },
  {
    id: "2",
    type: "result",
    title: "Résultats disponibles",
    description: "Les résultats du sondage 'Destination vacances' sont maintenant disponibles",
    time: "Il y a 1h",
    read: false,
  },
  {
    id: "3",
    type: "group",
    title: "Invitation au groupe",
    description: "Vous avez été invité à rejoindre le groupe 'Marketing'",
    time: "Il y a 2h",
    read: true,
  },
  {
    id: "4",
    type: "poll",
    title: "Rappel de vote",
    description: "Le sondage 'Date de la réunion' se termine dans 24h",
    time: "Hier",
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "poll":
        return <BarChart3 className="h-5 w-5" />
      case "group":
        return <Users className="h-5 w-5" />
      case "result":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <Card className={cn("transition-colors", !notification.read && "border-l-4 border-l-primary bg-primary/5")}>
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            notification.type === "poll" && "bg-blue-500/10 text-blue-500",
            notification.type === "group" && "bg-green-500/10 text-green-500",
            notification.type === "result" && "bg-purple-500/10 text-purple-500",
          )}
        >
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{notification.title}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{notification.time}</span>
          </div>
          <p className="text-sm text-muted-foreground">{notification.description}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {!notification.read && (
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => markAsRead(notification.id)}>
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => deleteNotification(notification.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes vos notifications ont été lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            Toutes
            <Badge variant="secondary" className="ml-1">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            Non lues
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <Bell className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">Aucune notification</h3>
              <p className="mt-2 text-sm text-muted-foreground">Vous n'avez pas encore de notifications</p>
            </div>
          ) : (
            notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} />)
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6 space-y-3">
          {notifications.filter((n) => !n.read).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">Tout est lu!</h3>
              <p className="mt-2 text-sm text-muted-foreground">Vous avez lu toutes vos notifications</p>
            </div>
          ) : (
            notifications
              .filter((n) => !n.read)
              .map((notification) => <NotificationItem key={notification.id} notification={notification} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
