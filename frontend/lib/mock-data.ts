import type { User } from "@/store/auth-store"
import type { Poll } from "@/store/poll-store"
import type { Group } from "@/store/group-store"

// Mock users
export const mockUsers: User[] = [
  {
    id: 1,
    username: "johndoe",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    avatarUrl: "/thoughtful-man-portrait.png",
    role: "user",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: 2,
    username: "janedoe",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    avatarUrl: "/woman-portrait.png",
    role: "user",
    createdAt: "2025-01-10T08:00:00Z",
  },
]

// Mock polls
export const mockPolls: Poll[] = [
  {
    id: 1,
    question: "Quel framework JavaScript préférez-vous pour 2025 ?",
    description: "Votez pour votre framework favori et découvrez ce que la communauté préfère !",
    options: [
      { index: 1, text: "React", votes: 45, percentage: 45 },
      { index: 2, text: "Vue.js", votes: 30, percentage: 30 },
      { index: 3, text: "Angular", votes: 18, percentage: 18 },
      { index: 4, text: "Svelte", votes: 7, percentage: 7 },
    ],
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    isPublic: true,
    totalVotes: 100,
    createdBy: 2,
    creatorName: "janedoe",
    creatorAvatar: "/woman-portrait.png",
    hasVoted: false,
    isCreator: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    question: "Meilleur langage backend en 2025 ?",
    description: "Quel langage de programmation utilisez-vous côté serveur ?",
    options: [
      { index: 1, text: "Node.js", votes: 42, percentage: 42 },
      { index: 2, text: "Python", votes: 35, percentage: 35 },
      { index: 3, text: "Go", votes: 15, percentage: 15 },
      { index: 4, text: "Rust", votes: 8, percentage: 8 },
    ],
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    isPublic: true,
    totalVotes: 100,
    createdBy: 1,
    creatorName: "johndoe",
    creatorAvatar: "/thoughtful-man-portrait.png",
    hasVoted: false,
    isCreator: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    question: "Quelle base de données NoSQL préférez-vous ?",
    options: [
      { index: 1, text: "MongoDB", votes: 55, percentage: 55 },
      { index: 2, text: "Redis", votes: 25, percentage: 25 },
      { index: 3, text: "Cassandra", votes: 12, percentage: 12 },
      { index: 4, text: "DynamoDB", votes: 8, percentage: 8 },
    ],
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ended",
    isPublic: true,
    totalVotes: 100,
    createdBy: 2,
    creatorName: "janedoe",
    hasVoted: true,
    myVote: 1,
    isCreator: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    question: "Quel outil de CI/CD utilisez-vous ?",
    options: [
      { index: 1, text: "GitHub Actions", votes: 60, percentage: 60 },
      { index: 2, text: "GitLab CI", votes: 25, percentage: 25 },
      { index: 3, text: "Jenkins", votes: 15, percentage: 15 },
    ],
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    isPublic: true,
    totalVotes: 100,
    createdBy: 1,
    creatorName: "johndoe",
    hasVoted: true,
    myVote: 1,
    isCreator: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock groups
export const mockGroups: Group[] = [
  {
    id: 1,
    name: "Équipe Dev Frontend",
    description:
      "Groupe dédié aux sondages de l'équipe frontend. Participez aux décisions sur les technologies, les pratiques et les projets.",
    isPublic: true,
    membersCount: 125,
    activePollsCount: 3,
    pendingRequests: 5,
    membershipStatus: "approved",
    myRole: "admin",
    createdBy: 1,
    creatorName: "johndoe",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: 2,
    name: "Club de Lecture Tech",
    description: "Votez pour les prochains livres techniques à lire ensemble.",
    isPublic: true,
    membersCount: 56,
    activePollsCount: 1,
    membershipStatus: "approved",
    myRole: "member",
    createdBy: 2,
    creatorName: "janedoe",
    createdAt: "2025-01-05T08:00:00Z",
  },
  {
    id: 3,
    name: "Marketing Team",
    description: "Sondages internes pour les campagnes marketing et stratégies.",
    isPublic: false,
    membersCount: 23,
    activePollsCount: 2,
    membershipStatus: "none",
    createdBy: 2,
    creatorName: "janedoe",
    createdAt: "2025-01-08T14:00:00Z",
  },
  {
    id: 4,
    name: "Design System",
    description: "Groupe pour voter sur les composants et guidelines du design system.",
    isPublic: true,
    membersCount: 42,
    activePollsCount: 0,
    membershipStatus: "pending",
    createdBy: 2,
    creatorName: "janedoe",
    createdAt: "2025-01-12T09:00:00Z",
  },
]

// FAQ items
export const faqItems = [
  {
    title: "Comment créer un sondage ?",
    content: `Pour créer un sondage, suivez ces étapes :

1. Cliquez sur le bouton "+ Créer un sondage" en haut du tableau de bord
2. Remplissez le formulaire :
   • Entrez votre question
   • Ajoutez 2 à 4 options de réponse
   • Définissez la date de fin du sondage
3. Choisissez si le sondage est public ou privé
4. Cliquez sur "Publier le sondage"

Note : En tant que créateur, vous ne pouvez pas voter sur votre propre sondage.`,
  },
  {
    title: "Comment voter ?",
    content: `Pour voter sur un sondage :

1. Trouvez un sondage qui vous intéresse dans le dashboard
2. Cliquez sur l'option de votre choix
3. Votre vote est immédiatement enregistré
4. Vous pouvez voir les résultats après avoir voté

Attention : Vous ne pouvez voter qu'une seule fois par sondage.`,
  },
  {
    title: "Comment créer un groupe ?",
    content: `Pour créer un groupe privé :

1. Accédez à la section "Groupes" via le menu
2. Cliquez sur "+ Créer un groupe"
3. Donnez un nom et une description à votre groupe
4. Choisissez si le groupe est public ou privé
5. Invitez des membres ou attendez les demandes d'adhésion`,
  },
  {
    title: "Comment changer mon mot de passe ?",
    content: `Pour modifier votre mot de passe :

1. Accédez à votre profil via le menu
2. Cliquez sur "Changer le mot de passe"
3. Entrez votre mot de passe actuel
4. Entrez votre nouveau mot de passe
5. Confirmez le nouveau mot de passe
6. Cliquez sur "Enregistrer"`,
  },
  {
    title: "Comment voir les statistiques de mes sondages ?",
    content: `Pour consulter les statistiques détaillées :

1. Accédez à "Mes Sondages" via le menu
2. Trouvez le sondage concerné
3. Cliquez sur "Voir les statistiques"
4. Vous verrez :
   • Le nombre total de votes
   • La répartition par option
   • L'évolution des votes dans le temps
   • Le taux de participation`,
  },
]
