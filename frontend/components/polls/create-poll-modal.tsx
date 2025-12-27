import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { usePollStore } from "@/store/poll-store"
import { useGroupStore } from "@/store/group-store"
import { Vote, Plus, Trash2, Loader2, AlertCircle, Users, CheckCircle2 } from "lucide-react"

interface CreatePollModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  groupId?: number
}

export function CreatePollModal({ open, onOpenChange, onSuccess, groupId }: CreatePollModalProps) {
  const { createPoll } = usePollStore()
  const { myGroups, fetchMyGroups } = useGroupStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: ["", ""],
    endDate: "",
    endTime: "",
    visibility: groupId ? "private" : "public" as "public" | "private",
    selectedGroupId: groupId?.toString() || "",
    pollType: "poll" as "poll" | "vote",
    isBinary: false,
  })

  useEffect(() => {
    if (open) {
      if (!groupId) {
        fetchMyGroups()
      } else {
        setFormData(prev => ({ ...prev, visibility: "private", selectedGroupId: groupId.toString() }))
      }
    }
  }, [open, groupId])

  // Groups where user is admin
  const adminGroups = myGroups?.created || []

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

    // Pour les sondages binaires, ne pas vérifier les options
    if (!formData.isBinary) {
      const validOptions = formData.options.filter((o) => o.trim())
      if (validOptions.length < 2) {
        toast.error("Veuillez entrer au moins 2 options")
        return
      }
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

    if (formData.visibility === "private" && !formData.selectedGroupId) {
      toast.error("Veuillez sélectionner un groupe")
      return
    }

    setIsLoading(true)

    try {
      const validOptions = formData.options.filter((o) => o.trim())
      const result = await createPoll({
        question: formData.question,
        description: formData.description || undefined,
        options: formData.isBinary ? [{ text: 'Oui' }, { text: 'Non' }] : validOptions.map(text => ({ text })),
        endTime: endTime.toISOString(),
        isPublic: formData.visibility === "public",
        groupId: formData.visibility === "private" ? parseInt(formData.selectedGroupId) : undefined,
        pollType: formData.pollType,
        isBinary: formData.isBinary,
      } as any)

      if (result.success) {
        toast.success(formData.isBinary ? "Sondage binaire créé avec succès !" : "Sondage créé avec succès !")
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
          selectedGroupId: groupId?.toString() || "",
          pollType: "poll",
          isBinary: false,
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

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-bold">
            <Vote className="h-6 w-6" />
            Créer un nouveau sondage
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-semibold">Question du sondage *</Label>
            <Input
              id="question"
              placeholder="Quel framework préférez-vous ?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="bg-card border-primary/10 focus-visible:border-primary/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Donnez plus de contexte pour aider les gens à décider..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-card border-primary/10 focus-visible:border-primary/30 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <Label className="text-sm font-semibold">Type de sondage</Label>

            {/* Option Sondage Binaire */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={formData.isBinary ? "default" : "outline"}
                onClick={() => setFormData({
                  ...formData,
                  isBinary: !formData.isBinary,
                  options: formData.isBinary ? ["", ""] : ["Oui", "Non"]
                })}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Sondage Binaire (Oui/Non)
              </Button>
            </div>

            {formData.isBinary && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ Les options seront automatiquement "Oui" et "Non"
                </p>
              </div>
            )}

            {/* Option Vote (uniquement pour groupes privés) */}
            {formData.visibility === "private" && formData.selectedGroupId && !formData.isBinary && (
              <div className="pt-2">
                <RadioGroup
                  value={formData.pollType}
                  onValueChange={(value: "poll" | "vote") => setFormData({ ...formData, pollType: value })}
                  className="flex flex-col gap-2"
                >
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${formData.pollType === 'poll' ? 'border-primary bg-background' : 'border-border'}`}>
                    <RadioGroupItem value="poll" id="poll" />
                    <Label htmlFor="poll" className="font-medium cursor-pointer flex-1">
                      Sondage standard
                      <span className="block text-xs text-muted-foreground font-normal">Les résultats sont visibles en temps réel</span>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${formData.pollType === 'vote' ? 'border-primary bg-background' : 'border-border'}`}>
                    <RadioGroupItem value="vote" id="vote" />
                    <Label htmlFor="vote" className="font-medium cursor-pointer flex-1">
                      Vote (résultats masqués)
                      <span className="block text-xs text-muted-foreground font-normal">Les résultats sont masqués jusqu'à la fin, seuls les votants peuvent les voir</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Options de réponse *</Label>
            {formData.isBinary ? (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Options automatiques :</span>
                </div>
                <div className="grid gap-2 ml-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600">1.</span>
                    <span className="text-sm text-green-700 dark:text-green-400">Oui</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600">2.</span>
                    <span className="text-sm text-green-700 dark:text-green-400">Non</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/50">
                          {index + 1}
                        </span>
                        <Input
                          placeholder={`Option ${index + 1}${index < 2 ? " *" : ""}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="pl-8 bg-card border-primary/10 focus-visible:border-primary/30"
                          required={index < 2}
                        />
                      </div>
                      {index >= 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {formData.options.length < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full bg-transparent border-dashed border-primary/20 hover:border-primary/40 text-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une option supplémentaire
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold text-foreground/80">Date d'échéance *</Label>
              <Input
                id="endDate"
                type="date"
                min={today}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-card border-primary/10 focus-visible:border-primary/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-semibold text-foreground/80">Heure de fin *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-card border-primary/10 focus-visible:border-primary/30"
                required
              />
            </div>
          </div>

          {!groupId ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Visibilité du sondage</Label>
                <RadioGroup
                  value={formData.visibility}
                  onValueChange={(value: "public" | "private") => setFormData({ ...formData, visibility: value })}
                  className="flex flex-col gap-2"
                >
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${formData.visibility === 'public' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="font-medium cursor-pointer flex-1">
                      Public
                      <span className="block text-xs text-muted-foreground font-normal">Visible par toute la communauté</span>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${formData.visibility === 'private' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="font-medium cursor-pointer flex-1">
                      Privé (Groupe spécifique)
                      <span className="block text-xs text-muted-foreground font-normal">Seuls les membres du groupe peuvent voter</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.visibility === "private" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="group" className="text-sm font-semibold">Sélectionner votre groupe *</Label>
                  {adminGroups.length > 0 ? (
                    <Select
                      value={formData.selectedGroupId}
                      onValueChange={(value) => setFormData({ ...formData, selectedGroupId: value })}
                    >
                      <SelectTrigger className="bg-card border-primary/10 w-full">
                        <SelectValue placeholder="Choisir l'un de vos groupes..." />
                      </SelectTrigger>
                      <SelectContent>
                        {adminGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              {g.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 shadow-sm">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-red-600 dark:text-red-400">Aucun groupe administré</p>
                          <p className="text-xs text-red-500/80">Vous ne pouvez créer des sondages privés que dans les groupes que vous avez créés.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-2 text-sm text-primary font-medium">
              <Users className="h-4 w-4" />
              Ce sondage sera publié dans ce groupe.
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs border border-amber-100 dark:border-amber-900/30 shadow-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Note : En tant que créateur, vous ne pourrez pas voter sur ce sondage pour garantir l'impartialité.</span>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-white font-bold shadow-lg shadow-primary/20"
            style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-700))` }}
            disabled={isLoading || (formData.visibility === 'private' && !formData.selectedGroupId)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publication en cours...
              </>
            ) : (
              <>
                <Vote className="h-5 w-5 mr-2" />
                Publier le sondage
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
