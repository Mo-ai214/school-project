import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useStore } from '../../store'
import type { AttendanceStatus } from '../../types'
import {
  STATUS_BADGES,
  STATUS_LABELS,
  TERMS,
  attendanceRate,
  average,
  formatDate,
  gradeTotal,
  rating,
  round1,
  weekdayName,
} from '../../lib/utils'
import { Badge, Button, Card, CardTitle, PageHeader, tableClass, tdClass, thClass } from '../../components/ui'

export default function StudentProfile() {
  const { id } = useParams()
  const { data, lookups } = useStore()
  const [term, setTerm] = useState(1)
  const student = id ? lookups.student.get(id) : undefined

  if (!student) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-slate-500">الطالب غير موجود</p>
        <Link to="/admin/students" className="font-bold text-indigo-600">
          العودة إلى قائمة الطلاب
        </Link>
      </Card>
    )
  }

  const classRoom = lookups.classRoom.get(student.classId)
  const records = data.attendance.filter((a) => a.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date))
  const counts = (Object.keys(STATUS_LABELS) as AttendanceStatus[]).map((s) => ({
    status: s,
    count: records.filter((r) => r.status === s).length,
  }))
  const grades = data.grades
    .filter((g) => g.studentId === student.id && g.term === term)
    .sort((a, b) => (lookups.subject.get(a.subjectId)?.name ?? '').localeCompare(lookups.subject.get(b.subjectId)?.name ?? '', 'ar'))
  const avg = round1(average(grades.map(gradeTotal)))

  const info: [string, string][] = [
    ['الرقم المدرسي', student.code],
    ['الصف', classRoom?.name ?? '—'],
    ['الجنس', student.gender],
    ['تاريخ الميلاد', formatDate(student.birthDate)],
    ['ولي الأمر', student.guardianName],
    ['هاتف ولي الأمر', student.guardianPhone],
    ['العنوان', student.address || '—'],
    ['تاريخ التسجيل', formatDate(student.enrolledAt)],
    ['رائد الصف', lookups.teacher.get(classRoom?.homeroomTeacherId ?? '')?.name ?? '—'],
  ]

  return (
    <>
      <Link to="/admin/students" className="no-print mb-4 inline-flex items-center gap-1 font-semibold text-indigo-600">
        <ArrowLeft className="h-4 w-4 rotate-180" />
        قائمة الطلاب
      </Link>
      <PageHeader
        title={student.name}
        subtitle={`${data.settings.schoolName} — العام الدراسي ${data.settings.academicYear}`}
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            طباعة الشهادة
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>البيانات الشخصية</CardTitle>
          <dl className="space-y-3">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-left font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle
            action={
              <div className="no-print flex gap-1 rounded-lg bg-slate-100 p-1">
                {TERMS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTerm(t.value)}
                    className={`rounded-md px-3 py-1 text-sm font-semibold ${term === t.value ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            }
          >
            كشف العلامات — {TERMS.find((t) => t.value === term)?.label}
          </CardTitle>
          {grades.length ? (
            <>
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>المادة</th>
                      <th className={thClass}>أعمال (20)</th>
                      <th className={thClass}>نصفي (30)</th>
                      <th className={thClass}>نهائي (50)</th>
                      <th className={thClass}>المجموع</th>
                      <th className={thClass}>التقدير</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((g) => {
                      const total = gradeTotal(g)
                      const r = rating(total)
                      return (
                        <tr key={g.id}>
                          <td className={`${tdClass} font-semibold`}>{lookups.subject.get(g.subjectId)?.name}</td>
                          <td className={tdClass}>{g.classwork}</td>
                          <td className={tdClass}>{g.midterm}</td>
                          <td className={tdClass}>{g.final}</td>
                          <td className={`${tdClass} font-bold`}>{total}</td>
                          <td className={tdClass}>
                            <Badge className={r.className}>{r.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-bold">المعدل العام</span>
                <span className="flex items-center gap-2 text-xl font-extrabold">
                  {avg}
                  <Badge className={rating(avg).className}>{rating(avg).label}</Badge>
                </span>
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-slate-400">لم يتم رصد علامات لهذا الفصل</p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle>
          سجل الحضور — نسبة الحضور {attendanceRate(records.map((r) => r.status))}%
        </CardTitle>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map((c) => (
            <div key={c.status} className={`rounded-xl p-3 text-center ${STATUS_BADGES[c.status]}`}>
              <p className="text-2xl font-extrabold">{c.count}</p>
              <p className="text-sm font-semibold">{STATUS_LABELS[c.status]}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {records.slice(0, 20).map((r) => (
            <span key={r.id} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${STATUS_BADGES[r.status]}`} title={weekdayName(r.date)}>
              {formatDate(r.date)} — {STATUS_LABELS[r.status]}
            </span>
          ))}
          {!records.length && <p className="text-slate-400">لا توجد سجلات حضور</p>}
        </div>
      </Card>
    </>
  )
}
