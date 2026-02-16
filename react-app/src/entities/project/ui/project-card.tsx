import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Trash2 } from "lucide-react"
import type { Project } from "../model/types"
import { ProjectStatusBadge } from "./project-status-badge"

interface ProjectCardProps {
  project: Project
  onOpen?: (project: Project) => void
  onDelete?: (project: Project) => void
}

export const ProjectCard = ({ project, onOpen, onDelete }: ProjectCardProps) => {
  return (
    <Card 
      className="bg-[#0f1729] border-gray-800 overflow-hidden hover:border-gray-700 transition-colors h-full flex flex-col"
    >
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-sm text-gray-500 mb-1">Код</div>
            <CardTitle className="text-base md:text-lg font-semibold text-white mb-0 truncate">
              {project.code}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4 pt-0 flex-1 flex flex-col">
        <div>
          <div className="text-xs md:text-sm text-gray-500 mb-1">Проект</div>
          <div className="text-white font-medium text-sm md:text-base line-clamp-2">{project.name}</div>
        </div>

        <div>
          <div className="text-xs md:text-sm text-gray-500 mb-1">Заказчик</div>
          <div className="text-white text-sm md:text-base line-clamp-1">{project.client}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-800">
          <div>
            <div className="text-xs md:text-sm text-gray-500 mb-1">Подразделение</div>
            <div className="text-white text-xs md:text-sm line-clamp-2">{project.department}</div>
          </div>
          <div>
            <div className="text-xs md:text-sm text-gray-500 mb-1">Вид работ</div>
            <div className="text-white text-xs md:text-sm">{project.workType}</div>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-800 mt-auto">
          <button 
            onClick={() => onOpen?.(project)}
            className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm md:text-base font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Открыть</span>
          </button>
          <button 
            onClick={() => onDelete?.(project)}
            className="px-3 md:px-4 py-2 md:py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-md text-red-500 transition-colors"
            aria-label="Удалить проект"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

