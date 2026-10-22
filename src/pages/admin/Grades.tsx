import { useState } from 'react'
import { Award, CheckCheck, Save } from 'lucide-react'
import { useStore } from '../../store'
import type { Student } from '../../types'
import { GRADE_MAX, TERMS, average, byName, gradeTotal, rating, round1 } from '../../lib/utils'
import { Badge, Button, Card, EmptyState, Field, PageHeader, Select, inputClass, tableClass, tdClass, thClass } from '../../components/ui'

type Row = { classwork: number | ''; midterm: number | ''; final: number | '' }
type Part = keyof Row

export default function Grades() {
  const { data } = useStore()
  const [classId, setClassId] = useState(data.classes[0]?.id ?? '')
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id ?? '')
  const [term, setTerm] = useState(1)
  const students = data.students.filter((s) => s.classId === classId).sort(byName)

  return (
    <>
      <PageHeader title="رصد العلامات" subtitle="أعمال الفصل (20) + الاختبار النصفي (30) + الاختبار النهائي (50) = 100" />
      <Card className="mb-6 grid gap-4 sm:grid-cols-3">
        <Field label="الصف">
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="المادة">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
      {students.length && subjectId ? (
        <GradeSheet key={`${classId}-${subjectId}-${term}`} students={students} subjectId={subjectId} term={term} />
      ) : (
        <Card>
          <EmptyState icon={Award} text="اختر صفاً يحتوي على طلاب ومادة دراسية" />
        </Card>
      )}
    </>
  )
}

function GradeSheet({ students, subjectId, term }: { students: Student[]; subjectId: string; term: number }) {
  const { data, saveGrades } = useStore()
  const [saved, setSaved] = useState(false)
  const [rows, setRows] = useState<Record<string, Row>>(() => {
    const init: Record<string, Row> = {}
    students.forEach((s) => {
      const g = data.grades.find((x) => x.studentId === s.id && x.subjectId === subjectId && x.term === term)
      init[s.id] = g ? { classwork: g.classwork, midterm: g.midterm, final: g.final } : { classwork: '', midterm: '', final: '' }
    })
    return init
  })

  const setPart = (studentId: string, part: Part, raw: string) => {
    setSaved(false)
    const value = raw === '' ? '' : Math.max(0, Math.min(GRADE_MAX[part], Number(raw)))
    setRows((r) => ({ ...r, [studentId]: { ...r[studentId], [part]: value } }))
  }

  const complete = (r: Row) => r.classwork !== '' && r.midterm !== '' && r.final !== ''
  const totals = students.map((s) => rows[s.id]).filter(complete).map((r) => gradeTotal(r as { classwork: number; midterm: number; final: number }))
  const avg = round1(average(totals))
  const passed = totals.filter((t) => t >= 50).length

  const save = () => {
    saveGrades(
      students
        .filter((s) => complete(rows[s.id]))
        .map((s) => {
          const r = rows[s.id]
          return { studentId: s.id, subjectId, term, classwork: Number(r.classwork), midterm: Number(r.midterm), final: Number(r.final) }
        }),
    )
    setSaved(true)
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-indigo-50 text-indigo-700">مرصود: {totals.length} / {students.length}</Badge>
          <Badge className="bg-sky-50 text-sky-700">المتوسط: {avg}</Badge>
          <Badge className="bg-emerald-50 text-emerald-700">ناجح: {passed}</Badge>
          <Badge className="bg-rose-50 text-rose-700">راسب: {totals.length - passed}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <CheckCheck className="h-4 w-4" />
              تم الحفظ
            </span>
          )}
          <Button onClick={save}>
            <Save className="h-4 w-4" />
            حفظ العلامات
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>#</th>
              <th className={thClass}>الطالب</th>
              <th className={thClass}>أعمال الفصل (20)</th>
              <th className={thClass}>النصفي (30)</th>
              <th className={thClass}>النهائي (50)</th>
              <th className={thClass}>المجموع</th>
              <th className={thClass}>التقدير</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => {
              const r = rows[s.id]
              const done = complete(r)
              const total = done ? gradeTotal(r as { classwork: number; midterm: number; final: number }) : null
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className={`${tdClass} text-slate-400`}>{i + 1}</td>
                  <td className={`${tdClass} font-semibold`}>{s.name}</td>
                  {(['classwork', 'midterm', 'final'] as Part[]).map((p) => (
                    <td key={p} className={tdClass}>
                      <input
                        type="number"
                        min={0}
                        max={GRADE_MAX[p]}
                        value={r[p]}
                        onChange={(e) => setPart(s.id, p, e.target.value)}
                        className={`${inputClass} w-20 py-1.5 text-center`}
                      />
                    </td>
                  ))}
                  <td className={`${tdClass} text-base font-extrabold`}>{total ?? '—'}</td>
                  <td className={tdClass}>
                    {total !== null ? <Badge className={rating(total).className}>{rating(total).label}</Badge> : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
