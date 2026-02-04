import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronDown, Search, Trash2, ExternalLink, Plus } from "lucide-react"

interface Project {
  id: number
  code: string
  name: string
  description?: string
  client: string
  department: string
  workType: string
  status: 'active' | 'completed' | 'pending'
}

const mockProjects: Project[] = [
  {
    id: 1,
    code: "PROJ-001",
    name: "Жилой комплекс \"Солнечный\"",
    client: "ООО \"Застройщик\"",
    department: "Производственно-технический отдел",
    workType: "Бетонные",
    status: "active"
  },
  {
    id: 2,
    code: "PROJ-002",
    name: "Офисный центр \"Бизнес Парк\"",
    client: "АО \"Девелопмент\"",
    department: "Производственно-технический отдел",
    workType: "Бетонные",
    status: "active"
  },
  {
    id: 3,
    code: "PROJ-003",
    name: "Торговый центр \"Мега\"",
    client: "ООО \"Ритейл\"",
    department: "Строительный отдел",
    workType: "Монолитные",
    status: "pending"
  },
  {
    id: 4,
    code: "PROJ-004",
    name: "Жилой комплекс \"Новый город\"",
    client: "АО \"СтройИнвест\"",
    department: "Производственно-технический отдел",
    workType: "Каркасные",
    status: "completed"
  },
]

export const ProjectPage = () => {
  const getStatusBadge = (status: Project['status']) => {
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

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <div 
        className="bg-[#0f1729] border-b border-gray-800 p-3 sticky top-0 z-10"
        style={{ paddingTop: 'max(2.5rem)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="relative flex-1 max-w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full bg-[#1a2332] border border-gray-700 rounded-md pl-8 pr-3 py-1.5 text-sm placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex gap-1.5 mb-2">
          <div className="relative flex-1">
            <select className="w-full bg-[#1a2332] border border-gray-700 rounded-md px-2 py-1.5 text-xs appearance-none pr-6">
              <option>Все статусы</option>
              <option>Активный</option>
              <option>Завершен</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative flex-1">
            <select className="w-full bg-[#1a2332] border border-gray-700 rounded-md px-2 py-1.5 text-xs appearance-none pr-6">
              <option>Все отделы</option>
              <option>ПТО</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative flex-1">
            <select className="w-full bg-[#1a2332] border border-gray-700 rounded-md px-2 py-1.5 text-xs appearance-none pr-6">
              <option>Все работы</option>
              <option>Бетонные</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 pb-24">
        {mockProjects.map((project) => (
          <Card 
            key={project.id} 
            className={cn(
              "bg-[#0f1729] border-gray-800 overflow-hidden",
              "hover:border-gray-700 transition-colors"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Код</div>
                  <CardTitle className="text-base font-semibold text-white mb-0">
                    {project.code}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(project.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div>
                <div className="text-xs text-gray-500 mb-1">Проект</div>
                <div className="text-white font-medium text-sm">{project.name}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Заказчик</div>
                <div className="text-white text-sm">{project.client}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Подразделение</div>
                  <div className="text-white text-xs">{project.department}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Вид работ</div>
                  <div className="text-white text-xs">{project.workType}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-800">
                <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Открыть
                </button>
                <button className="px-3 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-md text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-20 right-4 z-20">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
