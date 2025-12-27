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
import { LogIn, UserPlus, ShieldAlert } from "lucide-react"

interface LoginRequiredModalProps {
  open: boolean
  onClose: () => void
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl p-8">
        <DialogHeader className="space-y-4">
          <div className="mx-auto p-4 bg-primary/10 rounded-2xl w-fit">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-3xl font-extrabold tracking-tight">Connexion requise</DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground pt-1">
            Rejoignez-nous pour participer à ce sondage et faire entendre votre voix.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-6">
          <Button
            asChild
            className="h-12 text-base font-bold text-white shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-700) 100%)" }}
          >
            <Link href="/login">
              <LogIn className="h-5 w-5 mr-3" />
              Se connecter
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 text-base font-semibold border-border/50 bg-background/50 hover:bg-muted/50 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/register">
              <UserPlus className="h-5 w-5 mr-3" />
              Créer un compte
            </Link>
          </Button>
          <Button variant="ghost" onClick={onClose} className="h-11 rounded-xl text-muted-foreground hover:text-foreground">
            Continuer en tant que visiteur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
