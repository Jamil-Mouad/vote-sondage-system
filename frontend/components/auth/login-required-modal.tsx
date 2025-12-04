"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

interface LoginRequiredModalProps {
  open: boolean
  onClose: () => void
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Connexion requise</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Vous devez être connecté pour voter sur ce sondage
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button asChild style={{ background: "var(--primary)", color: "white" }} size="lg">
            <Link href="/login">
              <LogIn className="h-5 w-5 mr-2" />
              Se connecter
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">
              <UserPlus className="h-5 w-5 mr-2" />
              Créer un compte
            </Link>
          </Button>
          <Button variant="ghost" onClick={onClose} size="lg">
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
