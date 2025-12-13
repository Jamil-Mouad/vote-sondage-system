"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
import { Camera, User, Bell, Palette, Shield, Loader2, Check, Eye, EyeOff, Sun, Moon } from "lucide-react"
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
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      })
    }
  }, [user])

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
      toast.success("Profil mis à jour.")
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={user?.avatar ? `${API_URL.replace('/api', '')}${user.avatar}` : undefined} 
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button 
                    size="icon" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div>
                  <h3 className="font-medium">{user?.name || "Utilisateur"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
                  ) : saved ? (
                    <><Check className="mr-2 h-4 w-4" />Enregistré</>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-4 font-medium">Notifications par email</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux sondages</p>
                      <p className="text-sm text-muted-foreground">Recevez un email pour les nouveaux sondages</p>
                    </div>
                    <Switch
                      checked={notifications.emailPolls}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailPolls: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Résultats disponibles</p>
                      <p className="text-sm text-muted-foreground">Recevez un email quand les résultats sont disponibles</p>
                    </div>
                    <Switch
                      checked={notifications.emailResults}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailResults: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Invitations aux groupes</p>
                      <p className="text-sm text-muted-foreground">Recevez un email pour les invitations</p>
                    </div>
                    <Switch
                      checked={notifications.emailGroups}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailGroups: checked })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-medium">Notifications push</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux sondages</p>
                      <p className="text-sm text-muted-foreground">Notification push pour les nouveaux sondages</p>
                    </div>
                    <Switch
                      checked={notifications.pushPolls}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushPolls: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Résultats</p>
                      <p className="text-sm text-muted-foreground">Notification push pour les résultats</p>
                    </div>
                    <Switch
                      checked={notifications.pushResults}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushResults: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
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
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation</CardTitle>
              <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mode sombre</p>
                  <p className="text-sm text-muted-foreground">Basculez entre le mode clair et sombre</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-300",
                    theme === "light" ? "bg-slate-200" : "bg-slate-700"
                  )}
                >
                  <Sun className={cn(
                    "absolute left-1.5 h-4 w-4 transition-all duration-300",
                    theme === "light" ? "text-amber-500 scale-110" : "text-slate-500"
                  )} />
                  <Moon className={cn(
                    "absolute right-1.5 h-4 w-4 transition-all duration-300",
                    theme === "dark" ? "text-blue-400 scale-110" : "text-slate-400"
                  )} />
                  <span className={cn(
                    "h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300",
                    theme === "dark" ? "translate-x-8" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div>
                <p className="mb-3 font-medium">Couleur d'accent</p>
                <p className="mb-4 text-sm text-muted-foreground">Choisissez la couleur principale</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(themeColors) as AccentColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={cn(
                        "relative h-8 w-8 rounded-full transition-transform hover:scale-110",
                        accentColor === color && "ring-2 ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: themeColors[color].primary }}
                      title={themeColors[color].name}
                    >
                      {accentColor === color && <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Changer le mot de passe</p>
                  <p className="text-sm text-muted-foreground">Modifiez votre mot de passe</p>
                </div>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                <div>
                  <p className="font-medium text-destructive">Supprimer le compte</p>
                  <p className="text-sm text-muted-foreground">Cette action est irréversible</p>
                </div>
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>Entrez votre mot de passe actuel et le nouveau.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
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
            <DialogTitle className="text-destructive">Supprimer le compte</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Tapez <strong>SUPPRIMER</strong> pour confirmer :
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={isDeletingAccount || deleteConfirmText !== "SUPPRIMER"}
            >
              {isDeletingAccount ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Suppression...</> : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
