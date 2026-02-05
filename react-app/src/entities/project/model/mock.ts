import type { Project } from "./types"

export const mockProjects: Project[] = [
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

