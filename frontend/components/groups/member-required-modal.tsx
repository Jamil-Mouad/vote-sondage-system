"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserPlus, Users } from "lucide-react"

interface MemberRequiredModalProps {
  open: boolean
  onClose: () => void
  onJoinGroup: () => void
  groupName: string
}

export function MemberRequiredModal({ open, onClose, onJoinGroup, groupName }: MemberRequiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Membre requis</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Vous devez être membre de <strong>{groupName}</strong> pour voter sur ce sondage
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button onClick={onJoinGroup} style={{ background: "var(--primary)", color: "white" }} size="lg">
            <UserPlus className="h-5 w-5 mr-2" />
            Demander à rejoindre
          </Button>
          <Button variant="ghost" onClick={onClose} size="lg">
            Annuler
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Un administrateur devra approuver votre demande</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
