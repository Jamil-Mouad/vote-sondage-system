"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Mail, Link2, QrCode } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupCode: string
}

export function InviteMemberModal({ open, onOpenChange, groupCode }: InviteMemberModalProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")

  const inviteLink = `https://votepoll.app/join/${groupCode}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailInvite = () => {
    // Simulation d'envoi d'email
    alert(`Invitation envoyée à ${email}`)
    setEmail("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter des membres</DialogTitle>
          <DialogDescription>
            Partagez le code ou le lien d'invitation avec les personnes que vous souhaitez inviter
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="code" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code" className="gap-2">
              <QrCode className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="h-4 w-4" />
              Lien
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4 pt-4">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-muted p-6">
              <p className="text-sm text-muted-foreground">Code d'invitation</p>
              <p className="text-3xl font-bold tracking-widest">{groupCode}</p>
              <Button onClick={() => copyToClipboard(groupCode)} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié!" : "Copier le code"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Lien d'invitation</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                <Button size="icon" onClick={() => copyToClipboard(inviteLink)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleEmailInvite} disabled={!email}>
                  Envoyer
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
