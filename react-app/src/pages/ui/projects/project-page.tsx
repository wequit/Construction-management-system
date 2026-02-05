import { useState, useMemo } from "react"
import { mockProjects } from "@/entities/project"
import type { Project } from "@/entities/project"
import { ProjectHeader } from "@/widgets/project-header"
import { ProjectList } from "@/widgets/project-list"
import { CreateProjectButton } from "@/features/create-project"

export const ProjectPage = () => {
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [workTypeFilter, setWorkTypeFilter] = useState("")

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesSearch = searchValue === "" || 
        project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        project.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        project.client.toLowerCase().includes(searchValue.toLowerCase())

      const matchesStatus = statusFilter === "" || project.status === statusFilter
      const matchesDepartment = departmentFilter === "" || project.department.includes(departmentFilter)
      const matchesWorkType = workTypeFilter === "" || project.workType === workTypeFilter

      return matchesSearch && matchesStatus && matchesDepartment && matchesWorkType
    })
  }, [searchValue, statusFilter, departmentFilter, workTypeFilter])

  const handleOpenProject = (project: Project) => {
    console.log("Открыть проек", project)
  }

  const handleDeleteProject = (project: Project) => {
    console.log("Удалить проект", project)
  }

  const handleCreateProject = () => {
    console.log("Создать проект")
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-white max-w-7xl mx-auto">
      <ProjectHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        departmentFilter={departmentFilter}
        workTypeFilter={workTypeFilter}
        onStatusChange={setStatusFilter}
        onDepartmentChange={setDepartmentFilter}
        onWorkTypeChange={setWorkTypeFilter}
      />

      <ProjectList
        projects={filteredProjects}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
      />

      <CreateProjectButton onClick={handleCreateProject} />
    </div>
  )
}
