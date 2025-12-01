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
import { pollsApi } from "@/lib/api"
import { Vote, Plus, Trash2, Loader2, AlertCircle } from "lucide-react"

interface CreatePollModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  groupId?: number
}

export function CreatePollModal({ open, onOpenChange, onSuccess, groupId }: CreatePollModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: ["", ""],
    endDate: "",
    endTime: "",
    visibility: groupId ? "private" : "public",
  })

  const addOption = () => {
    if (formData.options.length < 4) {
      setFormData({ ...formData, options: [...formData.options, ""] })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.question.trim()) {
      toast.error("Veuillez entrer une question")
      return
    }

    const validOptions = formData.options.filter((o) => o.trim())
    if (validOptions.length < 2) {
      toast.error("Veuillez entrer au moins 2 options")
      return
    }

    if (!formData.endDate || !formData.endTime) {
      toast.error("Veuillez définir une date de fin")
      return
    }

    const endTime = new Date(`${formData.endDate}T${formData.endTime}`)
    if (endTime <= new Date()) {
      toast.error("La date de fin doit être dans le futur")
      return
    }

    setIsLoading(true)

    try {
      await pollsApi.createPoll({
        question: formData.question,
        description: formData.description || undefined,
        options: validOptions,
        endTime: endTime.toISOString(),
        isPublic: formData.visibility === "public",
        groupId: formData.visibility === "private" ? groupId : undefined,
      })

      toast.success("Sondage créé avec succès !")
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setFormData({
        question: "",
        description: "",
        options: ["", ""],
        endDate: "",
        endTime: "",
        visibility: groupId ? "private" : "public",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création")
    } finally {
      setIsLoading(false)
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" style={{ color: "var(--primary)" }} />
            Créer un nouveau sondage
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question du sondage *</Label>
            <Input
              id="question"
              placeholder="Quel framework préférez-vous ?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Donnez plus de contexte..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Options de réponse *</Label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}${index < 2 ? " *" : ""}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  required={index < 2}
                />
                {index >= 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {formData.options.length < 4 && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une option (max 4)
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin *</Label>
              <Input
                id="endDate"
                type="date"
                min={today}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Heure de fin *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          {!groupId && (
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="font-normal cursor-pointer">
                    Public (tous les utilisateurs)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="font-normal cursor-pointer">
                    Privé (groupe spécifique)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Note : Vous ne pourrez pas voter sur votre propre sondage.</span>
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
                <Vote className="h-4 w-4 mr-2" />
                Publier le sondage
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
