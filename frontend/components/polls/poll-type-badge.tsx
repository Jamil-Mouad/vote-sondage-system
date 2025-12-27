import { Badge } from "@/components/ui/badge"
import { Vote, CheckCircle2, HelpCircle } from "lucide-react"

interface PollTypeBadgeProps {
  type?: "poll" | "vote" | "binary_poll"
  className?: string
}

export function PollTypeBadge({ type = "poll", className }: PollTypeBadgeProps) {
  const config: Record<string, { label: string; icon: any; className: string }> = {
    poll: {
      label: "Sondage",
      icon: HelpCircle,
      className: "bg-blue-500 hover:bg-blue-600 text-white"
    },
    vote: {
      label: "Vote",
      icon: Vote,
      className: "bg-purple-500 hover:bg-purple-600 text-white"
    },
    binary_poll: {
      label: "Oui/Non",
      icon: CheckCircle2,
      className: "bg-green-500 hover:bg-green-600 text-white"
    }
  }

  // Utiliser 'poll' par défaut si le type n'existe pas dans config
  const pollConfig = config[type] || config.poll
  const { label, icon: Icon, className: badgeClassName } = pollConfig

  return (
    <Badge className={`${badgeClassName} ${className || ''}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}
