import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BookOpen, ClipboardCheck, GraduationCap, Mail, Newspaper, Plus, School, Users } from 'lucide-react'
import { useStore } from '../../store'
import { attendanceRate, formatDate, formatShortDate, todayISO } from '../../lib/utils'
import { Badge, Card, CardTitle, PageHeader, StatCard } from '../../components/ui'

export default function Dashboard() {
  const { data } = useStore()
  const dates = [...new Set(data.attendance.map((a) => a.date))].sort()
  const latestDate = dates.includes(todayISO()) ? todayISO() : dates[dates.length - 1]
  const latestRate = latestDate ? attendanceRate(data.attendance.filter((a) => a.date === latestDate).map((a) => a.status)) : 0

  const perClass = data.classes.map((c) => ({
    name: c.name,
    الطلاب: data.students.filter((s) => s.classId === c.id).length,
  }))
  const trend = dates.slice(-10).map((d) => ({
    name: formatShortDate(d),
    الحضور: attendanceRate(data.attendance.filter((a) => a.date === d).map((a) => a.status)),
  }))
  const genders = [
    { name: 'ذكور', value: data.students.filter((s) => s.gender === 'ذكر').length, color: '#4f46e5' },
    { name: 'إناث', value: data.students.filter((s) => s.gender === 'أنثى').length, color: '#ec4899' },
  ]
  const latestNews = [...data.news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  const unread = data.messages.filter((m) => !m.read)

  const quick = [
    { to: '/admin/students', label: 'إضافة طالب', icon: GraduationCap },
    { to: '/admin/attendance', label: 'تسجيل الحضور', icon: ClipboardCheck },
    { to: '/admin/grades', label: 'رصد العلامات', icon: BookOpen },
    { to: '/admin/news', label: 'نشر خبر', icon: Newspaper },
  ]

  return (
    <>
      <PageHeader title="لوحة التحكم" subtitle={`مرحباً بك في نظام إدارة ${data.settings.schoolName}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GraduationCap} label="عدد الطلاب" value={data.students.length} color="indigo" />
        <StatCard icon={Users} label="عدد المعلمين" value={data.teachers.length} color="violet" />
        <StatCard icon={School} label="عدد الصفوف" value={data.classes.length} color="sky" />
        <StatCard
          icon={ClipboardCheck}
          label="نسبة الحضور"
          value={`${latestRate}%`}
          hint={latestDate ? formatDate(latestDate) : 'لا توجد سجلات'}
          color="emerald"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="flex items-center gap-3 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-4 font-bold text-indigo-700 transition hover:bg-indigo-50"
          >
            <Plus className="h-5 w-5" />
            {q.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>نسبة الحضور خلال آخر أيام الدوام</CardTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="الحضور" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>توزيع الطلاب حسب الجنس</CardTitle>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genders} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {genders.map((g) => (
                    <Cell key={g.name} fill={g.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6">
            {genders.map((g) => (
              <div key={g.name} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full" style={{ background: g.color }} />
                {g.name}: <b>{g.value}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>عدد الطلاب في كل صف</CardTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perClass}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="الطلاب" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle
              action={
                <Link to="/admin/messages" className="text-sm font-semibold text-indigo-600">
                  الكل
                </Link>
              }
            >
              رسائل جديدة
            </CardTitle>
            {unread.length ? (
              <ul className="space-y-3">
                {unread.slice(0, 3).map((m) => (
                  <li key={m.id} className="flex items-start gap-3">
                    <Mail className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{m.subject}</p>
                      <p className="text-xs text-slate-400">{m.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">لا توجد رسائل جديدة</p>
            )}
          </Card>
          <Card>
            <CardTitle
              action={
                <Link to="/admin/news" className="text-sm font-semibold text-indigo-600">
                  الكل
                </Link>
              }
            >
              آخر الأخبار
            </CardTitle>
            <ul className="space-y-3">
              {latestNews.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{n.title}</span>
                  <Badge>{formatShortDate(n.date)}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
