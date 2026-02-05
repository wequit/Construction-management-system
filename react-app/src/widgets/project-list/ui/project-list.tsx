import { ProjectCard } from "@/entities/project"
import type { Project } from "@/entities/project"

interface ProjectListProps {
  projects: Project[]
  onOpenProject?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
}

export const ProjectList = ({ 
  projects, 
  onOpenProject, 
  onDeleteProject 
}: ProjectListProps) => {
  if (projects.length === 0) {
    return (
      <div className="p-4 md:p-6 text-center text-gray-400 text-sm md:text-base">
        Проекты не найдены
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-24 md:pb-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpenProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  )
}

