import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useStore } from '../../store'
import type { Student } from '../../types'
import { TERMS, attendanceRate, average, gradeTotal, rating, round1 } from '../../lib/utils'
import { Button, Input } from '../../components/ui'

export default function Results() {
  const { data, lookups } = useStore()
  const [code, setCode] = useState('')
  const [student, setStudent] = useState<Student | null>(null)
  const [notFound, setNotFound] = useState(false)
  const sample = data.students[0]?.code

  const search = (e: FormEvent) => {
    e.preventDefault()
    const found = data.students.find((s) => s.code === code.trim()) ?? null
    setStudent(found)
    setNotFound(!found)
  }

  return (
    <>
      <section className="bg-gradient-to-br from-indigo-700 to-violet-600 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold">استعلام النتائج</h1>
        <p className="mt-3 text-indigo-100">أدخل الرقم المدرسي للطالب لعرض علاماته ونسبة حضوره</p>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <form onSubmit={search} className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="الرقم المدرسي" required dir="ltr" className="text-right" />
          <Button type="submit" className="shrink-0">
            <Search className="h-4 w-4" />
            استعلام
          </Button>
        </form>
        {sample && (
          <p className="mt-2 text-sm text-slate-400">
            للتجربة استخدم الرقم: <code className="font-mono">{sample}</code>
          </p>
        )}

        {notFound && <p className="mt-6 rounded-xl bg-rose-50 p-4 text-center text-rose-700">لم يتم العثور على طالب بهذا الرقم</p>}

        {student && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">{student.name}</h2>
                <p className="text-slate-500">
                  {lookups.classRoom.get(student.classId)?.name ?? 'بدون صف'} — الرقم المدرسي {student.code}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">نسبة الحضور</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {attendanceRate(data.attendance.filter((a) => a.studentId === student.id).map((a) => a.status))}%
                </p>
              </div>
            </div>
            {TERMS.map((t) => {
              const rows = data.grades
                .filter((g) => g.studentId === student.id && g.term === t.value)
                .sort((a, b) => (lookups.subject.get(a.subjectId)?.name ?? '').localeCompare(lookups.subject.get(b.subjectId)?.name ?? '', 'ar'))
              if (!rows.length) return null
              const avg = round1(average(rows.map(gradeTotal)))
              const r = rating(avg)
              return (
                <div key={t.value} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between bg-slate-50 px-6 py-4">
                    <h3 className="text-lg font-bold">{t.label}</h3>
                    <span className={`rounded-full px-3 py-1 text-sm font-bold ${r.className}`}>
                      المعدل {avg} — {r.label}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="text-sm text-slate-500">
                        <tr>
                          <th className="px-6 py-3">المادة</th>
                          <th className="px-6 py-3">أعمال (20)</th>
                          <th className="px-6 py-3">نصفي (30)</th>
                          <th className="px-6 py-3">نهائي (50)</th>
                          <th className="px-6 py-3">المجموع</th>
                          <th className="px-6 py-3">التقدير</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((g) => {
                          const total = gradeTotal(g)
                          const rr = rating(total)
                          return (
                            <tr key={g.id} className="border-t border-slate-100">
                              <td className="px-6 py-3 font-semibold">{lookups.subject.get(g.subjectId)?.name}</td>
                              <td className="px-6 py-3">{g.classwork}</td>
                              <td className="px-6 py-3">{g.midterm}</td>
                              <td className="px-6 py-3">{g.final}</td>
                              <td className="px-6 py-3 font-bold">{total}</td>
                              <td className="px-6 py-3">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${rr.className}`}>{rr.label}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
            {!data.grades.some((g) => g.studentId === student.id) && (
              <p className="rounded-xl bg-amber-50 p-4 text-center text-amber-700">لم يتم رصد علامات لهذا الطالب بعد</p>
            )}
          </div>
        )}
      </section>
    </>
  )
}
