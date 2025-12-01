"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGroupStore } from "@/store/group-store"
import { KeyRound, Loader2, CheckCircle, XCircle } from "lucide-react"

interface JoinGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinGroupModal({ open, onOpenChange }: JoinGroupModalProps) {
  const { joinGroup } = useGroupStore()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setStatus("idle")

    // Simulation de l'appel API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const success = joinGroup(code.toUpperCase())

    if (success) {
      setStatus("success")
      setMessage("Vous avez rejoint le groupe avec succès!")
      setTimeout(() => {
        onOpenChange(false)
        setCode("")
        setStatus("idle")
      }, 1500)
    } else {
      setStatus("error")
      setMessage("Code invalide ou groupe non trouvé")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Rejoindre un groupe
          </DialogTitle>
          <DialogDescription>Entrez le code d'invitation pour rejoindre un groupe privé</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code d'invitation</Label>
              <Input
                id="code"
                placeholder="Ex: ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-widest"
                maxLength={10}
                disabled={isLoading || status === "success"}
              />
            </div>

            {status === "success" && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="text-sm">{message}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!code.trim() || isLoading || status === "success"}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Rejoindre"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
