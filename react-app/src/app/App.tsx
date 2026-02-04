import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './layout/app-layout'
import { DashboardPage } from '../pages/ui/dashboard/dashboard-page'
import { ProjectPage } from '../pages/ui/projects/project-page'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="/notifications" element={<DashboardPage />} />
          <Route path="/profile" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
