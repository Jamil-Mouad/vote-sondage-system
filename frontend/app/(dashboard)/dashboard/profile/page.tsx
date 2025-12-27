"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuthStore } from "@/store/auth-store"
import { useThemeStore } from "@/store/theme-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Camera, User, Bell, Palette, Shield, Loader2, Check, Eye, EyeOff, Sun, Moon, Lock, Upload, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { themeColors, type AccentColor } from "@/lib/theme-config"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ProfilePage() {
  const { user, token, updateProfile, uploadAvatar, changePassword } = useAuthStore()
  const { theme, toggleTheme, accentColor, setAccentColor } = useThemeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Password change dialog
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Delete account dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  })
  const [initialFormData, setInitialFormData] = useState(formData)
  const [isDirty, setIsDirty] = useState(false)

  const [notifications, setNotifications] = useState({
    emailPolls: true,
    emailResults: true,
    emailGroups: false,
    pushPolls: true,
    pushResults: true,
  })

  // Load user data
  useEffect(() => {
    if (user) {
      const newData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      }
      setFormData(newData)
      setInitialFormData(newData)
    }
  }, [user])

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialFormData))
  }, [formData, initialFormData])

  // Load notifications preferences
  useEffect(() => {
    const loadNotifications = async () => {
      if (!token) return
      try {
        const response = await fetch(`${API_URL}/users/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          if (data.data) setNotifications(data.data)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }
    loadNotifications()
  }, [token])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error("Seuls les fichiers .jpeg, .jpg et .png sont autorisés.")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La taille du fichier ne doit pas dépasser 2 Mo.")
      return
    }

    setIsUploadingAvatar(true)
    try {
      await uploadAvatar(file)
      toast.success("Photo de profil mise à jour.")
    } catch (error: any) {
      toast.error(error.message || "Échec de la mise à jour de la photo.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setIsDirty(false)
    toast.info("Modifications annulées")
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
      })
      setSaved(true)
      setInitialFormData(formData)
      setIsDirty(false)
      toast.success("Profil mis à jour avec succès.")
      setTimeout(() => setSaved(false), 2000)
    } catch (error: any) {
      toast.error(error.message || "Échec de la mise à jour du profil.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    try {
      const response = await fetch(`${API_URL}/users/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      })
      if (!response.ok) throw new Error('Failed to save')
      toast.success("Préférences de notifications enregistrées.")
    } catch (error: any) {
      toast.error(error.message || "Échec de l'enregistrement.")
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Veuillez remplir tous les champs.")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.")
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      toast.success("Mot de passe modifié.")
      setIsPasswordDialogOpen(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast.error(error.message || "Échec de la modification.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") {
      toast.error("Tapez 'SUPPRIMER' pour confirmer.")
      return
    }

    setIsDeletingAccount(true)
    try {
      const response = await fetch(`${API_URL}/users/account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success("Compte supprimé.")
      useAuthStore.getState().logout()
      window.location.href = '/'
    } catch (error: any) {
      toast.error(error.message || "Échec de la suppression.")
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion du Profil</h1>
        <p className="text-muted-foreground text-lg">Gérez vos informations personnelles et préférences de sécurité.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start h-14 bg-muted/50 p-1 rounded-2xl overflow-x-auto">
          <TabsTrigger value="profile" className="rounded-xl h-12 px-6 gap-2 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl h-12 px-6 gap-2 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-xl h-12 px-6 gap-2 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
            <Palette className="h-4 w-4" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl h-12 px-6 gap-2 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/10 pb-8 border-b border-border/50">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-border/20 relative z-10 transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage
                      src={user?.avatar ? `${API_URL.replace('/api', '')}${user.avatar}` : undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl bg-muted">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/60 rounded-full z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                    <Camera className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {!isUploadingAvatar && (
                    <div className="absolute bottom-0 right-0 z-30 bg-primary text-primary-foreground rounded-full p-2 shadow-lg ring-4 ring-background transform transition-transform group-hover:scale-110">
                      <Upload className="h-4 w-4" />
                    </div>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 z-40 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="text-center sm:text-left space-y-2">
                  <h2 className="text-2xl font-bold">{user?.name || "Utilisateur"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Button variant="outline" size="sm" className="mt-2 rounded-full h-8" onClick={handleAvatarClick}>
                    Changer la photo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground ml-1">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Votre prénom"
                    className="h-12 bg-muted/20 border-border/50 focus:bg-background transition-colors rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground ml-1">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Votre nom"
                    className="h-12 bg-muted/20 border-border/50 focus:bg-background transition-colors rounded-xl"
                  />
                </div>

                <div className="space-y-3 relative group">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">
                    Email <span className="text-xs text-muted-foreground/60 font-normal ml-2">(Non modifiable)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      className="h-12 bg-muted/50 border-transparent text-muted-foreground cursor-not-allowed pl-11 rounded-xl"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute inset-0 z-10 cursor-not-allowed" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pour changer votre email, contactez le support.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground ml-1">
                    Téléphone <span className="text-xs text-muted-foreground/60 font-normal ml-2">(Format international)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 bg-muted/20 border-border/50 focus:bg-background transition-colors rounded-xl"
                  />
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="bio" className="text-sm font-medium text-muted-foreground">Bio</Label>
                    <span className={cn(
                      "text-xs transition-colors",
                      formData.bio.length > 160 ? "text-destructive font-medium" : "text-muted-foreground/60"
                    )}>
                      {formData.bio.length} / 160
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    placeholder="Dites quelque chose à propos de vous..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="min-h-[120px] bg-muted/20 border-border/50 focus:bg-background transition-colors rounded-xl resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground ml-1">Une brève description qui apparaîtra sur votre profil public.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-6 flex items-center justify-between border-t border-border/50 sticky bottom-0 z-10 backdrop-blur-md">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
                disabled={!isDirty || isLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={!isDirty || isLoading}
                className={cn(
                  "rounded-full px-8 transition-all duration-300",
                  isDirty ? "shadow-lg scale-100" : "opacity-80 scale-95"
                )}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                ) : saved ? (
                  <><Check className="mr-2 h-4 w-4" />Enregistré</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Enregistrer</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-lg">Emails</h4>
                  </div>
                  <div className="grid gap-4 pl-4 border-l-2 border-muted ml-4">
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">Nouveaux sondages</p>
                        <p className="text-sm text-muted-foreground">Recevez un email lorsqu'un nouveau sondage est disponible</p>
                      </div>
                      <Switch
                        checked={notifications.emailPolls}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailPolls: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">Résultats disponibles</p>
                        <p className="text-sm text-muted-foreground">Soyez notifié de la clôture des votes</p>
                      </div>
                      <Switch
                        checked={notifications.emailResults}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailResults: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">Invitations aux groupes</p>
                        <p className="text-sm text-muted-foreground">Ne manquez jamais une invitation</p>
                      </div>
                      <Switch
                        checked={notifications.emailGroups}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailGroups: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-lg">Push Mobile</h4>
                  </div>
                  <div className="grid gap-4 pl-4 border-l-2 border-muted ml-4">
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">Nouveaux sondages</p>
                        <p className="text-sm text-muted-foreground">Notification instantanée sur votre appareil</p>
                      </div>
                      <Switch
                        checked={notifications.pushPolls}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, pushPolls: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">Résultats</p>
                        <p className="text-sm text-muted-foreground">Sachez tout de suite qui a gagné</p>
                      </div>
                      <Switch
                        checked={notifications.pushResults}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, pushResults: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={isSavingNotifications} className="rounded-full px-8">
                  {isSavingNotifications ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                  ) : (
                    "Enregistrer les préférences"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Personnalisation</CardTitle>
              <CardDescription>Personnalisez l'apparence de l'application à votre goût</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                    {theme === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-400" />}
                  </div>
                  <div>
                    <p className="font-medium">Mode {theme === 'light' ? 'Clair' : 'Sombre'}</p>
                    <p className="text-sm text-muted-foreground">Basculez entre les thèmes jour et nuit</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-300 shadow-inner",
                    theme === "light" ? "bg-slate-200" : "bg-slate-700"
                  )}
                >
                  <Sun className={cn(
                    "absolute left-1.5 h-4 w-4 transition-all duration-300",
                    theme === "light" ? "text-amber-500 scale-110" : "text-slate-500 opacity-50"
                  )} />
                  <Moon className={cn(
                    "absolute right-1.5 h-4 w-4 transition-all duration-300",
                    theme === "dark" ? "text-blue-400 scale-110" : "text-slate-400 opacity-50"
                  )} />
                  <span className={cn(
                    "h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300",
                    theme === "dark" ? "translate-x-8" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div>
                <p className="mb-4 font-medium text-lg">Couleur d'accentuation</p>
                <div className="flex flex-wrap gap-4">
                  {(Object.keys(themeColors) as AccentColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={cn(
                        "group relative h-14 w-14 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1",
                        accentColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" : "hover:shadow-md bg-muted/20"
                      )}
                    >
                      <span
                        className="h-6 w-6 rounded-full shadow-sm"
                        style={{ backgroundColor: themeColors[color].primary }}
                      />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{themeColors[color].name}</span>
                      {accentColor === color && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte et vos données sensibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="flex items-center justify-between rounded-xl border border-border/50 p-6 bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Changer le mot de passe</p>
                    <p className="text-sm text-muted-foreground">Une bonne pratique est de le changer régulièrement</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full" onClick={() => setIsPasswordDialogOpen(true)}>
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-destructive/20 p-6 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                    <X className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-destructive">Supprimer le compte</p>
                    <p className="text-sm text-red-600/60 dark:text-red-400/60">Attention, cette action est irréversible</p>
                  </div>
                </div>
                <Button variant="destructive" className="rounded-full shadow-lg shadow-destructive/20" onClick={() => setIsDeleteDialogOpen(true)}>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>Entrez votre mot de passe actuel pour vérification, puis le nouveau.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground ml-1">Minimum 8 caractères</p>
            </div>
            <div className="space-y-2">
              <Label>Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Modification...</> : "Changer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <X className="h-5 w-5" />
              Supprimer le compte
            </DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement votre compte et toutes vos données.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 bg-destructive/5 p-4 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium text-destructive">
              Veuillez taper <strong>SUPPRIMER</strong> pour confirmer :
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              className="border-destructive/30 focus-visible:ring-destructive/30"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || deleteConfirmText !== "SUPPRIMER"}
            >
              {isDeletingAccount ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Suppression...</> : "Confirmer la suppression"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
