import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './layout/app-layout'
import { DashboardPage } from '../pages/ui/dashboard/dashboard-page'
import { ProjectPage } from '../pages/ui/projects/project-page'
import { NotificationsPage } from '../pages/ui/notifications/notifications-page'
import { ProfilePage } from '../pages/ui/profile/profile-page'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
