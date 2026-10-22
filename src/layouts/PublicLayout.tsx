import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Lock, Mail, MapPin, Menu, Phone, X } from 'lucide-react'
import { useEffect } from 'react'
import { useStore } from '../store'
import Logo from '../components/Logo'

const currentYear = new Date().getFullYear()

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/about', label: 'عن المدرسة' },
  { to: '/news', label: 'الأخبار' },
  { to: '/results', label: 'استعلام النتائج' },
  { to: '/contact', label: 'تواصل معنا' },
]

export default function PublicLayout() {
  const { data } = useStore()
  const { settings } = data
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 font-semibold transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-700'}`

  return (
    <div className="flex min-h-screen flex-col">
      <div className="hidden bg-slate-900 text-sm text-slate-300 sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              <span dir="ltr">{settings.phone}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              {settings.email}
            </span>
          </div>
          <span>العام الدراسي {settings.academicYear}</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/">
            <Logo name={settings.schoolName} />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end className={navClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="hidden items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:inline-flex"
            >
              <Lock className="h-4 w-4" />
              بوابة الإدارة
            </Link>
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="القائمة">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-slate-100 px-4 py-3 lg:hidden">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end className={navClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/admin" className={navClass} onClick={() => setOpen(false)}>
              بوابة الإدارة
            </NavLink>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div className="space-y-3">
            <Logo name={settings.schoolName} light />
            <p className="text-sm leading-7 text-slate-400">{settings.slogan}</p>
          </div>
          <div>
            <h4 className="mb-3 font-bold text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-bold text-white">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                {settings.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span dir="ltr">{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                {settings.email}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-sm text-slate-500">
          جميع الحقوق محفوظة © {currentYear} {settings.schoolName}
        </div>
      </footer>
    </div>
  )
}
