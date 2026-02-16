export type RoadmapEdge = {
  from: string
  to: string
  type: 'start' | 'mid' | 'finish'
}

export type RoadmapStatus = {
  id: number
  project_id: number
  section_code: string
  request_date?: string
  due_date?: string
  valid_until_date?: string
  executor_company?: string
  executor_authority?: string
  execution_status: string
  document_status?: string
  note?: string
  files_count: number
}
