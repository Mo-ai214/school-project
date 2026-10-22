import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, User } from 'lucide-react'
import { useStore } from '../store'
import { Button, Field, Input } from '../components/ui'
import Logo from '../components/Logo'

export default function Login() {
  const { data, login, isAuthed } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (isAuthed) return <Navigate to={from} replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (login(username, password)) navigate(from, { replace: true })
    else setError('اسم المستخدم أو كلمة المرور غير صحيحة')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <Logo name={data.settings.schoolName} />
        </div>
        <h1 className="text-center text-2xl font-extrabold text-slate-900">تسجيل دخول الإدارة</h1>
        <p className="mb-6 mt-1 text-center text-slate-500">أدخل بياناتك للوصول إلى لوحة التحكم</p>
        <form onSubmit={submit} className="space-y-4">
          <Field label="اسم المستخدم">
            <div className="relative">
              <User className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="pr-10" autoFocus required />
            </div>
          </Field>
          <Field label="كلمة المرور">
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" required />
            </div>
          </Field>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <Button type="submit" className="w-full py-3">
            دخول
          </Button>
        </form>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-bold">بيانات الدخول الافتراضية:</p>
          <p>
            اسم المستخدم: <code className="font-mono">admin</code> — كلمة المرور: <code className="font-mono">admin123</code>
          </p>
          <p className="mt-1 text-xs text-slate-400">يمكن تغييرها من صفحة الإعدادات.</p>
        </div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          العودة إلى الموقع
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
