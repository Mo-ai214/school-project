import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChartColumn,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  School,
  Search,
  Settings,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useStore, type Data } from '../store'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  count?: (data: Data) => number
  alert?: boolean
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'الرئيسية',
    items: [{ to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'الإدارة الأكاديمية',
    items: [
      { to: '/admin/students', label: 'الطلاب', icon: GraduationCap, count: (d) => d.students.length },
      { to: '/admin/teachers', label: 'المعلمون', icon: Users, count: (d) => d.teachers.length },
      { to: '/admin/classes', label: 'الصفوف', icon: School, count: (d) => d.classes.length },
      { to: '/admin/subjects', label: 'المواد الدراسية', icon: BookOpen, count: (d) => d.subjects.length },
      { to: '/admin/schedule', label: 'الجدول الدراسي', icon: CalendarDays },
    ],
  },
  {
    title: 'الشؤون اليومية',
    items: [
      { to: '/admin/attendance', label: 'الحضور والغياب', icon: ClipboardCheck },
      { to: '/admin/grades', label: 'العلامات', icon: Award },
      { to: '/admin/reports', label: 'التقارير والإحصائيات', icon: ChartColumn },
    ],
  },
  {
    title: 'التواصل',
    items: [
      { to: '/admin/news', label: 'الأخبار', icon: Newspaper, count: (d) => d.news.length },
      {
        to: '/admin/messages',
        label: 'الرسائل',
        icon: Mail,
        count: (d) => d.messages.filter((m) => !m.read).length,
        alert: true,
      },
    ],
  },
  {
    title: 'النظام',
    items: [{ to: '/admin/settings', label: 'الإعدادات', icon: Settings }],
  },
]

const allItems = sections.flatMap((s) => s.items)
const COLLAPSE_KEY = 'school-project:sidebar-collapsed'

function currentItem(pathname: string) {
  return [...allItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => (i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(i.to + '/')))
}

export default function AdminLayout() {
  const { data, logout } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const unread = data.messages.filter((m) => !m.read).length

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1')
      return !c
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return sections
    return sections
      .map((s) => ({ ...s, items: s.items.filter((i) => i.label.includes(q)) }))
      .filter((s) => s.items.length > 0)
  }, [query])

  const active = currentItem(pathname)
  const isProfile = /^\/admin\/students\/.+/.test(pathname)

  const renderSidebar = (mini: boolean) => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-slate-300">
      <div className={`flex items-center gap-3 border-b border-white/10 py-5 ${mini ? 'justify-center px-2' : 'px-5'}`}>
        <Link to="/admin" className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/50">
            <GraduationCap className="h-6 w-6" />
          </span>
          {!mini && (
            <span className="min-w-0">
              <span className="block truncate font-extrabold text-white">{data.settings.schoolName}</span>
              <span className="block text-xs text-slate-400">لوحة الإدارة · {data.settings.academicYear}</span>
            </span>
          )}
        </Link>
      </div>

      {!mini && (
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في القائمة..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </div>
      )}

      <nav
        className={`sidebar-scroll flex-1 py-4 ${mini ? 'overflow-visible px-2' : 'overflow-y-auto px-3'}`}
        onClick={(e) => (e.target as HTMLElement).closest('a') && setMobileOpen(false)}
      >
        {filtered.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? 'mt-5' : ''}>
            {mini ? (
              idx > 0 && <div className="mx-3 mb-3 border-t border-white/10" />
            ) : (
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{section.title}</p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const count = item.count?.(data) ?? 0
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    aria-label={item.label}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                        mini ? 'justify-center px-0' : 'px-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute -right-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-indigo-400" />}
                        <item.icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                        {!mini && <span className="flex-1 truncate">{item.label}</span>}
                        {count > 0 &&
                          (mini ? (
                            item.alert && <span className="absolute left-2 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                          ) : (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                item.alert
                                  ? 'bg-rose-500 text-white'
                                  : isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/5 text-slate-400'
                              }`}
                            >
                              {count}
                            </span>
                          ))}
                        {mini && (
                          <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                            {item.label}
                            {count > 0 && ` (${count})`}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-500">لا توجد نتائج</p>}
      </nav>

      <div className={`border-t border-white/10 ${mini ? 'p-2' : 'p-3'}`}>
        <div className={`flex items-center gap-3 rounded-xl bg-white/5 ${mini ? 'flex-col p-2' : 'p-3'}`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 font-bold text-white">
            م
          </span>
          {!mini && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">مدير النظام</p>
              <p className="truncate text-xs text-slate-400" dir="ltr">
                @{data.settings.adminUsername}
              </p>
            </div>
          )}
          <div className={`flex gap-1 ${mini ? 'flex-col' : ''}`}>
            <Link to="/" title="عرض الموقع" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button onClick={handleLogout} title="تسجيل الخروج" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-300">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={`no-print fixed inset-y-0 right-0 z-30 hidden transition-[width] duration-300 lg:block ${collapsed ? 'w-20' : 'w-72'}`}
      >
        {renderSidebar(collapsed)}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          className="absolute -left-3.5 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-indigo-600 hover:text-white"
        >
          {collapsed ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
        </button>
      </aside>

      <div
        className={`no-print fixed inset-0 z-40 lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 right-0 w-72 max-w-[85vw] shadow-2xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {renderSidebar(false)}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق القائمة"
            className="absolute left-3 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </aside>
      </div>

      <div className={`transition-[margin] duration-300 ${collapsed ? 'lg:mr-20' : 'lg:mr-72'}`}>
        <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="فتح القائمة"
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="مسار التنقل">
              <Link to="/admin" className="font-semibold text-slate-400 hover:text-indigo-600">
                الإدارة
              </Link>
              {active && active.to !== '/admin' && (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300" />
                  <Link to={active.to} className={`truncate font-semibold ${isProfile ? 'text-slate-400 hover:text-indigo-600' : 'text-slate-800'}`}>
                    {active.label}
                  </Link>
                </>
              )}
              {active?.to === '/admin' && (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300" />
                  <span className="font-semibold text-slate-800">لوحة التحكم</span>
                </>
              )}
              {isProfile && (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300" />
                  <span className="truncate font-semibold text-slate-800">ملف الطالب</span>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 sm:inline">
              العام الدراسي <span dir="ltr">{data.settings.academicYear}</span>
            </span>
            <Link
              to="/admin/messages"
              title="الرسائل"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Link
              to="/"
              title="عرض الموقع"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:flex"
            >
              <ExternalLink className="h-4 w-4" />
              عرض الموقع
            </Link>
          </div>
        </header>
        <main className="print-full mx-auto max-w-7xl p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
