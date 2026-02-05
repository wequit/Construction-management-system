export interface Project {
  id: number
  code: string
  name: string
  description?: string
  client: string
  department: string
  workType: string
  status: 'active' | 'completed' | 'pending'
}

export type ProjectStatus = Project['status']

