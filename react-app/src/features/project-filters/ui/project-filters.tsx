import { ChevronDown } from "lucide-react"

interface ProjectFiltersProps {
  statusFilter: string
  departmentFilter: string
  workTypeFilter: string
  onStatusChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onWorkTypeChange: (value: string) => void
}

export const ProjectFilters = ({
  statusFilter,
  departmentFilter,
  workTypeFilter,
  onStatusChange,
  onDepartmentChange,
  onWorkTypeChange,
}: ProjectFiltersProps) => {
  return (
    <div className="flex flex-row gap-2 md:gap-3 mb-2">
      <div className="relative flex-1">
        <select 
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full bg-[#1a2332] border border-gray-700 rounded-md px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm appearance-none pr-6 md:pr-8"
        >
          <option value="">Все статусы</option>
          <option value="active">Активный</option>
          <option value="completed">Завершен</option>
          <option value="pending">В ожидании</option>
        </select>
        <ChevronDown className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
      </div>
      
      <div className="relative flex-1">
        <select 
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="w-full bg-[#1a2332] border border-gray-700 rounded-md px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm appearance-none pr-6 md:pr-8"
        >
          <option value="">Все отделы</option>
          <option value="ПТО">ПТО</option>
        </select>
        <ChevronDown className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
      </div>
      
      <div className="relative flex-1">
        <select 
          value={workTypeFilter}
          onChange={(e) => onWorkTypeChange(e.target.value)}
          className="w-full bg-[#1a2332] border border-gray-700 rounded-md px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm appearance-none pr-6 md:pr-8"
        >
          <option value="">Все работы</option>
          <option value="Бетонные">Бетонные</option>
          <option value="Монолитные">Монолитные</option>
          <option value="Каркасные">Каркасные</option>
        </select>
        <ChevronDown className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

