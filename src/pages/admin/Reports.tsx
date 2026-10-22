import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, ClipboardCheck, Medal, Percent, Printer } from 'lucide-react'
import { useStore } from '../../store'
import { TERMS, attendanceRate, average, gradeTotal, rating, round1 } from '../../lib/utils'
import { Badge, Button, Card, CardTitle, Field, PageHeader, Select, StatCard, tableClass, tdClass, thClass } from '../../components/ui'

export default function Reports() {
  const { data, lookups } = useStore()
  const [classId, setClassId] = useState('')
  const [term, setTerm] = useState(1)

  const students = data.students.filter((s) => !classId || s.classId === classId)
  const ids = new Set(students.map((s) => s.id))
  const grades = data.grades.filter((g) => g.term === term && ids.has(g.studentId))
  const attendance = data.attendance.filter((a) => ids.has(a.studentId))

  const totals = grades.map(gradeTotal)
  const overallAvg = round1(average(totals))
  const passRate = totals.length ? round1((totals.filter((t) => t >= 50).length / totals.length) * 100) : 0
  const attRate = attendanceRate(attendance.map((a) => a.status))

  const studentAvgs = students
    .map((s) => {
      const g = grades.filter((x) => x.studentId === s.id).map(gradeTotal)
      return { s, avg: g.length ? round1(average(g)) : null }
    })
    .filter((x): x is { s: (typeof students)[number]; avg: number } => x.avg !== null)
    .sort((a, b) => b.avg - a.avg)

  const bySubject = data.subjects.map((sub) => ({
    name: sub.name,
    المتوسط: round1(average(grades.filter((g) => g.subjectId === sub.id).map(gradeTotal))),
  }))

  const byClass = data.classes.map((c) => {
    const cIds = new Set(data.students.filter((s) => s.classId === c.id).map((s) => s.id))
    const cGrades = data.grades.filter((g) => g.term === term && cIds.has(g.studentId)).map(gradeTotal)
    return {
      id: c.id,
      name: c.name,
      المتوسط: round1(average(cGrades)),
      الحضور: attendanceRate(data.attendance.filter((a) => cIds.has(a.studentId)).map((a) => a.status)),
      students: cIds.size,
      pass: cGrades.length ? round1((cGrades.filter((t) => t >= 50).length / cGrades.length) * 100) : 0,
    }
  })

  const distribution = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'راسب'].map((label) => ({
    name: label,
    العدد: studentAvgs.filter((x) => rating(x.avg).label === label).length,
  }))
  const distColors = ['#10b981', '#14b8a6', '#0ea5e9', '#f59e0b', '#f43f5e']

  return (
    <>
      <PageHeader
        title="التقارير والإحصائيات"
        subtitle={`${classId ? lookups.classRoom.get(classId)?.name : 'جميع الصفوف'} — ${TERMS.find((t) => t.value === term)?.label}`}
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            طباعة التقرير
          </Button>
        }
      />
      <Card className="no-print mb-6 grid gap-4 sm:grid-cols-2">
        <Field label="الصف">
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">جميع الصفوف</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="الفصل الدراسي">
          <Select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
            {TERMS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Award} label="المعدل العام" value={overallAvg} color="indigo" />
        <StatCard icon={Percent} label="نسبة النجاح" value={`${passRate}%`} color="emerald" />
        <StatCard icon={ClipboardCheck} label="نسبة الحضور" value={`${attRate}%`} color="sky" />
        <StatCard icon={Medal} label="الأول" value={studentAvgs[0]?.avg ?? '—'} hint={studentAvgs[0]?.s.name} color="amber" />
      </div>

      {!grades.length && <p className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-800">لا توجد علامات مرصودة لهذا الفصل بعد.</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>متوسط العلامات حسب المادة</CardTitle>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySubject} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} orientation="right" />
                <Tooltip />
                <Bar dataKey="المتوسط" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>توزيع الطلاب حسب التقدير</CardTitle>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="العدد" radius={[6, 6, 0, 0]}>
                  {distribution.map((d, i) => (
                    <Cell key={d.name} fill={distColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="p-5 pb-0">
            <CardTitle>مقارنة الصفوف</CardTitle>
          </div>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>الصف</th>
                  <th className={thClass}>الطلاب</th>
                  <th className={thClass}>المعدل</th>
                  <th className={thClass}>النجاح</th>
                  <th className={thClass}>الحضور</th>
                </tr>
              </thead>
              <tbody>
                {byClass.map((c) => (
                  <tr key={c.id} className={c.id === classId ? 'bg-indigo-50' : ''}>
                    <td className={`${tdClass} font-semibold`}>{c.name}</td>
                    <td className={tdClass}>{c.students}</td>
                    <td className={tdClass}>{c['المتوسط']}</td>
                    <td className={tdClass}>{c.pass}%</td>
                    <td className={tdClass}>{c['الحضور']}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-0">
          <div className="p-5 pb-0">
            <CardTitle>لوحة الشرف — أعلى 10 طلاب</CardTitle>
          </div>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>الطالب</th>
                  <th className={thClass}>الصف</th>
                  <th className={thClass}>المعدل</th>
                  <th className={thClass}>التقدير</th>
                </tr>
              </thead>
              <tbody>
                {studentAvgs.slice(0, 10).map(({ s, avg }, i) => (
                  <tr key={s.id}>
                    <td className={`${tdClass} font-bold ${i < 3 ? 'text-amber-500' : 'text-slate-400'}`}>{i + 1}</td>
                    <td className={`${tdClass} font-semibold`}>{s.name}</td>
                    <td className={tdClass}>{lookups.classRoom.get(s.classId)?.name}</td>
                    <td className={`${tdClass} font-bold`}>{avg}</td>
                    <td className={tdClass}>
                      <Badge className={rating(avg).className}>{rating(avg).label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
