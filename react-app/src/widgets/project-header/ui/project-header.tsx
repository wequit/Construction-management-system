import { ProjectSearch } from "@/features/project-search"
import { ProjectFilters } from "@/features/project-filters"

interface ProjectHeaderProps {
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: string
  departmentFilter: string
  workTypeFilter: string
  onStatusChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onWorkTypeChange: (value: string) => void
}

export const ProjectHeader = ({
  searchValue,
  onSearchChange,
  statusFilter,
  departmentFilter,
  workTypeFilter,
  onStatusChange,
  onDepartmentChange,
  onWorkTypeChange,
}: ProjectHeaderProps) => {
  return (
    <div 
      className="bg-[#0f1729] border-b border-gray-800 p-3 md:p-4 sticky top-0 z-10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <h1 className="text-xl md:text-2xl font-bold hidden md:block">Проекты</h1>
        <ProjectSearch 
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>

      <ProjectFilters
        statusFilter={statusFilter}
        departmentFilter={departmentFilter}
        workTypeFilter={workTypeFilter}
        onStatusChange={onStatusChange}
        onDepartmentChange={onDepartmentChange}
        onWorkTypeChange={onWorkTypeChange}
      />
    </div>
  )
}

