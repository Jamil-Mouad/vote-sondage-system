"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useGroupStore } from "@/store/group-store"
import { Users, Loader2 } from "lucide-react"

interface CreateGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateGroupModal({ open, onOpenChange, onSuccess }: CreateGroupModalProps) {
  const { createGroup } = useGroupStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "public",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Veuillez entrer un nom de groupe")
      return
    }

    setIsLoading(true)

    try {
      const result = await createGroup({
        name: formData.name,
        description: formData.description || undefined,
        isPublic: formData.visibility === "public",
      })

      if (result.success) {
        toast.success("Groupe créé avec succès !")
        onOpenChange(false)
        onSuccess?.()

        // Reset form
        setFormData({
          name: "",
          description: "",
          visibility: "public",
        })
      } else {
        toast.error(result.error || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: "var(--primary)" }} />
            Créer un nouveau groupe
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du groupe *</Label>
            <Input
              id="name"
              placeholder="Équipe Dev Frontend"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Groupe dédié aux sondages de l'équipe frontend..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Visibilité du groupe</Label>
            <RadioGroup
              value={formData.visibility}
              onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              className="space-y-2"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="public" id="public-group" className="mt-0.5" />
                <Label htmlFor="public-group" className="font-normal cursor-pointer">
                  <span className="font-medium block">Public</span>
                  <span className="text-sm text-muted-foreground">
                    Visible et rejoignable par tous les utilisateurs
                  </span>
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="private" id="private-group" className="mt-0.5" />
                <Label htmlFor="private-group" className="font-normal cursor-pointer">
                  <span className="font-medium block">Privé</span>
                  <span className="text-sm text-muted-foreground">Sur invitation uniquement</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            className="w-full"
            style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Créer le groupe
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
