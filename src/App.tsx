import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useStore } from './store'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/public/Home'
import About from './pages/public/About'
import News from './pages/public/News'
import NewsDetail from './pages/public/NewsDetail'
import Results from './pages/public/Results'
import Contact from './pages/public/Contact'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import StudentProfile from './pages/admin/StudentProfile'
import Teachers from './pages/admin/Teachers'
import Classes from './pages/admin/Classes'
import Subjects from './pages/admin/Subjects'
import Schedule from './pages/admin/Schedule'
import Attendance from './pages/admin/Attendance'
import Grades from './pages/admin/Grades'
import Reports from './pages/admin/Reports'
import NewsAdmin from './pages/admin/NewsAdmin'
import Messages from './pages/admin/Messages'
import SettingsPage from './pages/admin/SettingsPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed } = useStore()
  const location = useLocation()
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="news" element={<News />} />
        <Route path="news/:id" element={<NewsDetail />} />
        <Route path="results" element={<Results />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route
        path="admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="grades" element={<Grades />} />
        <Route path="reports" element={<Reports />} />
        <Route path="news" element={<NewsAdmin />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
