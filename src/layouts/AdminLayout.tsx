import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  School,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import Logo from '../components/Logo'

const sections = [
  {
    title: 'عام',
    items: [{ to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'الإدارة الأكاديمية',
    items: [
      { to: '/admin/students', label: 'الطلاب', icon: GraduationCap },
      { to: '/admin/teachers', label: 'المعلمون', icon: Users },
      { to: '/admin/classes', label: 'الصفوف', icon: School },
      { to: '/admin/subjects', label: 'المواد الدراسية', icon: BookOpen },
      { to: '/admin/schedule', label: 'الجدول الدراسي', icon: CalendarDays },
    ],
  },
  {
    title: 'المتابعة والتقييم',
    items: [
      { to: '/admin/attendance', label: 'الحضور والغياب', icon: ClipboardCheck },
      { to: '/admin/grades', label: 'العلامات', icon: Award },
      { to: '/admin/reports', label: 'التقارير', icon: ChartColumn },
    ],
  },
  {
    title: 'الموقع والتواصل',
    items: [
      { to: '/admin/news', label: 'الأخبار', icon: Newspaper },
      { to: '/admin/messages', label: 'الرسائل', icon: Mail, badge: 'messages' as const },
      { to: '/admin/settings', label: 'الإعدادات', icon: Settings },
    ],
  },
]

export default function AdminLayout() {
  const { data, logout } = useStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const unread = data.messages.filter((m) => !m.read).length

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-5 py-4">
        <Link to="/admin">
          <Logo name={data.settings.schoolName} />
        </Link>
      </div>
      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}
      >
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-bold text-slate-400">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold transition ${
                      isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {'badge' in item && unread > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">{unread}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-slate-100 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-slate-600 hover:bg-slate-100">
          <ExternalLink className="h-5 w-5" />
          عرض الموقع
        </Link>
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="no-print fixed inset-y-0 right-0 z-30 hidden w-72 border-l border-slate-200 bg-white lg:block">{sidebar}</aside>

      {open && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-72 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:mr-72">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="القائمة">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="font-semibold text-slate-500">العام الدراسي {data.settings.academicYear}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">مدير النظام</p>
              <p className="text-xs text-slate-400" dir="ltr">
                {data.settings.adminUsername}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">م</div>
          </div>
        </header>
        <main className="print-full mx-auto max-w-7xl p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
