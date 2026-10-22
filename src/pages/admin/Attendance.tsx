import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck, ClipboardCheck } from 'lucide-react'
import { useStore } from '../../store'
import type { AttendanceStatus } from '../../types'
import { STATUS_BADGES, STATUS_LABELS, STATUS_STYLES, attendanceRate, byName, isSchoolDay, todayISO, weekdayName } from '../../lib/utils'
import { Button, Card, CardTitle, EmptyState, Field, Input, PageHeader, Select } from '../../components/ui'

const statuses = Object.keys(STATUS_LABELS) as AttendanceStatus[]

export default function Attendance() {
  const { data, setAttendance } = useStore()
  const [classId, setClassId] = useState(data.classes[0]?.id ?? '')
  const [date, setDate] = useState(todayISO())

  const students = data.students.filter((s) => s.classId === classId).sort(byName)
  const ids = new Set(students.map((s) => s.id))
  const dayRecords = new Map(data.attendance.filter((a) => a.date === date && ids.has(a.studentId)).map((a) => [a.studentId, a.status]))
  const counts = statuses.map((s) => ({ s, n: [...dayRecords.values()].filter((v) => v === s).length }))
  const unmarked = students.length - dayRecords.size

  const absentees = students
    .map((s) => {
      const recs = data.attendance.filter((a) => a.studentId === s.id)
      return { s, absences: recs.filter((r) => r.status === 'absent').length, rate: attendanceRate(recs.map((r) => r.status)) }
    })
    .filter((x) => x.absences > 0)
    .sort((a, b) => b.absences - a.absences)
    .slice(0, 6)

  const weekend = !isSchoolDay(new Date(date + 'T00:00:00'))

  return (
    <>
      <PageHeader title="الحضور والغياب" subtitle="سجّل حضور الطلاب يومياً — يتم الحفظ تلقائياً" />
      <Card className="mb-6 grid gap-4 sm:grid-cols-3 sm:items-end">
        <Field label="الصف">
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`التاريخ (${weekdayName(date)})`}>
          <Input type="date" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </Field>
        <Button
          variant="success"
          disabled={!students.length}
          onClick={() => setAttendance(date, students.map((s) => ({ studentId: s.id, status: 'present' })))}
        >
          <CheckCheck className="h-4 w-4" />
          تحديد الكل حاضر
        </Button>
      </Card>

      {weekend && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-amber-800">تنبيه: التاريخ المختار يوم عطلة نهاية الأسبوع.</p>}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counts.map(({ s, n }) => (
          <div key={s} className={`rounded-xl p-3 text-center ${STATUS_BADGES[s]}`}>
            <p className="text-2xl font-extrabold">{n}</p>
            <p className="text-sm font-semibold">{STATUS_LABELS[s]}</p>
          </div>
        ))}
        <div className="rounded-xl bg-slate-100 p-3 text-center text-slate-600">
          <p className="text-2xl font-extrabold">{unmarked}</p>
          <p className="text-sm font-semibold">غير مسجل</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          {students.length ? (
            <ul className="divide-y divide-slate-100">
              {students.map((s, i) => {
                const current = dayRecords.get(s.id)
                return (
                  <li key={s.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-sm text-slate-400">{i + 1}</span>
                      <Link to={`/admin/students/${s.id}`} className="font-semibold hover:text-indigo-700">
                        {s.name}
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {statuses.map((st) => (
                        <button
                          key={st}
                          onClick={() => setAttendance(date, [{ studentId: s.id, status: st }])}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                            current === st ? STATUS_STYLES[st] : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {STATUS_LABELS[st]}
                        </button>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState icon={ClipboardCheck} text="لا يوجد طلاب في هذا الصف" />
          )}
        </Card>
        <Card>
          <CardTitle>الأكثر غياباً في الصف</CardTitle>
          {absentees.length ? (
            <ul className="space-y-3">
              {absentees.map(({ s, absences, rate }) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{s.name}</span>
                  <span className="shrink-0 text-sm">
                    <b className="text-rose-600">{absences}</b> غياب — {rate}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">لا يوجد غياب مسجل</p>
          )}
        </Card>
      </div>
    </>
  )
}
