"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, MessageCircle, Book, Mail, Phone, Search, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api-client"

const faqs = [
  {
    question: "Comment créer un sondage ?",
    answer:
      "Pour créer un sondage, cliquez sur le bouton 'Créer un sondage' dans le tableau de bord ou dans la page d'un groupe. Remplissez le titre, la description et ajoutez vos options. Vous pouvez définir une date de fin et choisir si le sondage est public ou privé.",
  },
  {
    question: "Comment rejoindre un groupe ?",
    answer:
      "Vous pouvez rejoindre un groupe de deux manières : soit en utilisant un code d'invitation fourni par un membre du groupe, soit en recherchant des groupes publics dans l'onglet 'Découvrir' de la page Groupes.",
  },
  {
    question: "Puis-je modifier mon vote ?",
    answer:
      "Une fois votre vote enregistré, vous ne pouvez pas le modifier. Assurez-vous de bien vérifier votre choix avant de valider.",
  },
  {
    question: "Comment voir les résultats d'un sondage ?",
    answer:
      "Les résultats sont visibles après avoir voté ou une fois le sondage terminé. Rendez-vous dans 'Mes sondages' ou 'Historique' pour consulter les statistiques détaillées.",
  },
  {
    question: "Comment supprimer mon compte ?",
    answer:
      "Vous pouvez supprimer votre compte depuis les paramètres de sécurité de votre profil. Attention, cette action est irréversible et supprimera toutes vos données.",
  },
  {
    question: "Les sondages sont-ils anonymes ?",
    answer:
      "Par défaut, les votes sont anonymes. Le créateur du sondage peut voir qui a voté mais pas pour quelle option, sauf si l'option 'votes visibles' est activée.",
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  })

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsSubmitting(true)
    
    try {
      await apiRequest("/support/message", {
        method: "POST",
        body: JSON.stringify({
          subject: contactForm.subject,
          message: contactForm.message,
        }),
      })
      
      toast.success("Message envoyé avec succès !", {
        description: "Nous vous répondrons dans les plus brefs délais.",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      })
      setContactForm({ subject: "", message: "" })
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi", {
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aide & Support</h1>
        <p className="text-muted-foreground">Trouvez des réponses à vos questions ou contactez-nous</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Questions fréquentes
              </CardTitle>
              <CardDescription>Les réponses aux questions les plus courantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFaqs.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Aucune question ne correspond à votre recherche
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Nous contacter
              </CardTitle>
              <CardDescription>Vous n'avez pas trouvé de réponse ? Envoyez-nous un message</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    placeholder="De quoi s'agit-il ?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre problème ou question..."
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le message"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Ressources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Book className="h-4 w-4" />
                Guide de démarrage
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <HelpCircle className="h-4 w-4" />
                Tutoriels vidéo
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <MessageCircle className="h-4 w-4" />
                Communauté
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact direct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">bakkalifirdaousai@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">+212 6 93 31 32 50</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
