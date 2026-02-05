import { Badge } from "@/components/ui/badge"
import type { ProjectStatus } from "../model/types"

interface ProjectStatusBadgeProps {
  status: ProjectStatus
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  switch (status) {
    case 'active':
      return (
        <Badge 
          variant="default" 
          className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
        >
          Активный
        </Badge>
      )
    case 'pending':
      return (
        <Badge 
          variant="default" 
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
        >
          В ожидании
        </Badge>
      )
    case 'completed':
      return <Badge variant="secondary">Завершен</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

