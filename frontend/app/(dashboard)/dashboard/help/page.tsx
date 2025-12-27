"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  HelpCircle, MessageCircle, Book, Mail, Phone, Search,
  Loader2, CheckCircle, ArrowLeft, Shield, UserCircle,
  PlusCircle, Users, ExternalLink, Video, Compass, Info
} from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const faqs = [
  {
    category: "sondages",
    question: "Comment créer un sondage ?",
    answer: "Pour créer un sondage, cliquez sur le bouton 'Créer un sondage' dans le tableau de bord ou dans la page d'un groupe. Remplissez le titre, la description et ajoutez vos options. Vous pouvez définir une date de fin et choisir si le sondage est public ou privé.",
  },
  {
    category: "groupes",
    question: "Comment rejoindre un groupe ?",
    answer: "Vous pouvez rejoindre un groupe de deux manières : soit en utilisant un code d'invitation fourni par un membre du groupe, soit en recherchant des groupes publics dans l'onglet 'Découvrir' de la page Groupes.",
  },
  {
    category: "votes",
    question: "Puis-je modifier mon vote ?",
    answer: "Une fois votre vote enregistré, vous ne pouvez pas le modifier. Assurez-vous de bien vérifier votre choix avant de valider.",
  },
  {
    category: "resultats",
    question: "Comment voir les résultats d'un sondage ?",
    answer: "Les résultats sont visibles après avoir voté ou une fois le sondage terminé. Rendez-vous dans 'Mes sondages' ou 'Historique' pour consulter les statistiques détaillées.",
  },
  {
    category: "compte",
    question: "Comment supprimer mon compte ?",
    answer: "Vous pouvez supprimer votre compte depuis les paramètres de sécurité de votre profil. Attention, cette action est irréversible et supprimera toutes vos données.",
  },
  {
    category: "securite",
    question: "Les sondages sont-ils anonymes ?",
    answer: "Par défaut, les votes sont anonymes. Le créateur du sondage peut voir qui a voté mais pas pour quelle option, sauf si l'option 'votes visibles' est activée.",
  },
]

const categories = [
  { id: 'all', title: 'Toutes les aides', icon: Compass, color: 'text-primary' },
  { id: 'compte', title: 'Mon Compte', icon: UserCircle, color: 'text-blue-500' },
  { id: 'sondages', title: 'Sondages', icon: PlusCircle, color: 'text-purple-500' },
  { id: 'groupes', title: 'Communautés', icon: Users, color: 'text-green-500' },
  { id: 'securite', title: 'Sécurité', icon: Shield, color: 'text-orange-500' },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({ subject: "", message: "" })

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  })

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
        body: JSON.stringify(contactForm),
      })
      toast.success("Message envoyé ! Nous vous répondrons bientôt.", {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      })
      setContactForm({ subject: "", message: "" })
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi")
    } finally { setIsSubmitting(false) }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-in fade-in duration-1000">
      {/* Back Button Ghost */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground/60 hover:text-primary transition-colors group">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour au tableau de bord
      </Link>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/10 shadow-2xl p-8 lg:p-16">
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
                Comment pouvons-nous <span className="text-primary italic">vous aider ?</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-md">
                Trouvez des guides, des réponses à vos questions ou contactez directement notre équipe de support.
              </p>
            </div>

            <div className="relative group max-w-xl">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-card shadow-xl rounded-2xl border border-border/50 p-2 group-focus-within:ring-2 ring-primary/20 transition-all">
                <Search className="ml-4 h-6 w-6 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Posez votre question ici..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none focus-visible:ring-0 text-lg h-12 bg-transparent"
                />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
            <img
              src="/support-icon-light-mode-public.png"
              alt="Support"
              className="relative z-10 w-full max-w-sm drop-shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] dark:hidden animate-float"
            />
            <img
              src="/support-icon-dark-mode-public.png"
              alt="Support"
              className="relative z-10 w-full max-w-sm drop-shadow-[0_20px_50px_rgba(var(--primary-rgb),0.5)] hidden dark:block animate-float"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center gap-4 text-center group",
              activeCategory === cat.id
                ? "bg-primary text-white shadow-xl shadow-primary/20 border-primary scale-105"
                : "bg-card/40 border-border/50 hover:bg-card hover:border-primary/30 shadow-lg"
            )}
          >
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
              activeCategory === cat.id ? "bg-white/20" : "bg-muted group-hover:bg-primary/10"
            )}>
              <cat.icon className={cn("h-6 w-6", activeCategory === cat.id ? "text-white" : cat.color)} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">{cat.title}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* FAQ Area */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-2 rounded-full bg-primary" />
              <h2 className="text-3xl font-black tracking-tight">Questions Fréquentes</h2>
            </div>

            <div className="bg-card/40 border border-border/50 rounded-[2.5rem] overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-none px-6">
                    <AccordionTrigger className="text-left text-lg font-bold py-6 hover:no-underline hover:text-primary transition-colors group">
                      <div className="flex items-center gap-4">
                        <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                          Q{index + 1}
                        </span>
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6 pl-12 border-b border-border/20">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                )) : (
                  <div className="py-20 text-center space-y-4">
                    <Info className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-muted-foreground font-medium">Aucun résultat pour votre recherche.</p>
                  </div>
                )}
              </Accordion>
            </div>
          </div>

          {/* Contact Form */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-2 rounded-full bg-primary/40" />
              <h2 className="text-3xl font-black tracking-tight">Toujours bloqué ?</h2>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card overflow-hidden">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 bg-gradient-to-br from-primary via-primary to-primary-700 p-8 text-primary-foreground flex flex-col justify-between">
                  <div className="space-y-4">
                    <MessageCircle className="h-12 w-12 opacity-50" />
                    <h3 className="text-2xl font-black">Envoyez-nous un signal</h3>
                    <p className="text-primary-foreground/80 text-sm leading-relaxed">
                      Notre équipe intervient généralement en moins de 24h pour résoudre vos problèmes techniques ou répondre à vos suggestions.
                    </p>
                  </div>
                  <div className="pt-8">
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Temps de réponse moyen</p>
                    <p className="text-xl font-bold">~ 4 heures</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitContact} className="w-full md:w-2/3 p-10 space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Sujet du message</Label>
                      <Input
                        id="subject"
                        placeholder="Ex: Problème de connexion, Suggestion..."
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="rounded-2xl h-12 bg-muted/30 border-none focus-visible:ring-primary/20"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Détails</Label>
                      <Textarea
                        id="message"
                        placeholder="Décrivez votre situation en quelques lignes..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 min-h-[150px]"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-700))' }}>
                    {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Envoyer mon message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary/80 ml-2">Ressources Utiles</h3>
            <div className="grid gap-4">
              {[
                { title: 'Guide utilisateur', icon: Book, color: 'bg-blue-500', desc: 'Apprenez les bases de Vote.' },
                { title: 'Tutoriels Vidéo', icon: Video, color: 'bg-red-500', desc: 'Démo étape par étape.' },
                { title: 'Communauté', icon: MessageCircle, color: 'bg-green-500', desc: 'Discutez avec les utilisateurs.' },
              ].map((res, i) => (
                <button key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-card/60 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card hover:translate-x-1 transition-all group text-left">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg", res.color)}>
                    <res.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{res.title}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{res.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Glassmorphic Contact Card */}
          <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black tracking-tight">Contact Direct</h3>
              <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed">
                Besoin d'une réponse immédiate ? Nos lignes sont ouvertes.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Email</p>
                  <p className="text-sm font-bold truncate">support@vote-app.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Téléphone</p>
                  <p className="text-sm font-bold">+212 6 93 31 32 50</p>
                </div>
              </div>
            </div>

            <div className="pt-4 relative z-10">
              <div className="bg-primary/20 rounded-2xl p-4 border border-primary/30 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Status Support</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold">Agents en ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

