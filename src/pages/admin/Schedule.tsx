import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, Printer, TriangleAlert } from 'lucide-react'
import { useStore } from '../../store'
import { DAYS, PERIODS, PERIOD_TIMES } from '../../lib/utils'
import { Button, Card, EmptyState, Field, Modal, PageHeader, Select } from '../../components/ui'

const palette = [
  'bg-indigo-50 text-indigo-800 ring-indigo-200',
  'bg-emerald-50 text-emerald-800 ring-emerald-200',
  'bg-amber-50 text-amber-800 ring-amber-200',
  'bg-rose-50 text-rose-800 ring-rose-200',
  'bg-sky-50 text-sky-800 ring-sky-200',
  'bg-violet-50 text-violet-800 ring-violet-200',
  'bg-teal-50 text-teal-800 ring-teal-200',
  'bg-orange-50 text-orange-800 ring-orange-200',
  'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200',
  'bg-lime-50 text-lime-800 ring-lime-200',
]

export default function Schedule() {
  const { data, lookups, setScheduleCell } = useStore()
  const [params, setParams] = useSearchParams()
  const mode = params.get('mode') === 'teacher' ? 'teacher' : 'class'
  const selected = params.get(mode) ?? (mode === 'class' ? data.classes[0]?.id : data.teachers[0]?.id) ?? ''
  const [cell, setCell] = useState<{ day: number; period: number; subjectId: string; teacherId: string } | null>(null)

  const colorOf = (subjectId: string) => palette[Math.max(0, data.subjects.findIndex((s) => s.id === subjectId)) % palette.length]

  const entries = data.schedule.filter((e) => (mode === 'class' ? e.classId === selected : e.teacherId === selected))
  const at = (day: number, period: number) => entries.find((e) => e.day === day && e.period === period)

  const conflict =
    cell && cell.teacherId
      ? data.schedule.find(
          (e) => e.teacherId === cell.teacherId && e.day === cell.day && e.period === cell.period && e.classId !== selected,
        )
      : undefined

  const subjectTeachers = cell ? data.teachers.filter((t) => t.subjectIds.includes(cell.subjectId)) : []
  const options = mode === 'class' ? data.classes : data.teachers
  const hoursUsed = mode === 'class' ? entries.length : 0

  return (
    <>
      <PageHeader
        title="الجدول الدراسي"
        subtitle="انقر على أي حصة لتعديلها (في عرض الصف)"
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
        }
      />
      <Card className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['class', 'teacher'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setParams({ mode: m })}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${mode === m ? 'bg-white shadow-sm' : 'text-slate-500'}`}
            >
              {m === 'class' ? 'حسب الصف' : 'حسب المعلم'}
            </button>
          ))}
        </div>
        <Field label={mode === 'class' ? 'الصف' : 'المعلم'} className="flex-1">
          <Select value={selected} onChange={(e) => setParams({ mode, [mode]: e.target.value })}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-sm text-slate-500">
          {mode === 'class'
            ? `${hoursUsed} حصة من أصل ${DAYS.length * PERIODS.length}`
            : `${entries.length} حصة أسبوعياً`}
        </p>
      </Card>

      {!selected ? (
        <Card>
          <EmptyState icon={CalendarDays} text="أضف صفوفاً ومعلمين أولاً" />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 className="hidden p-4 text-xl font-bold print:block">
            جدول {mode === 'class' ? lookups.classRoom.get(selected)?.name : lookups.teacher.get(selected)?.name}
          </h2>
          <table className="w-full min-w-[900px] table-fixed border-collapse text-center text-sm">
            <thead>
              <tr>
                <th className="w-28 bg-slate-50 p-3 font-bold text-slate-600">اليوم</th>
                {PERIODS.map((p, i) => (
                  <th key={p} className="bg-slate-50 p-3 font-bold text-slate-600">
                    الحصة {p}
                    <span className="block text-xs font-normal text-slate-400" dir="ltr">
                      {PERIOD_TIMES[i]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((dayName, day) => (
                <tr key={day}>
                  <td className="border-t border-slate-100 bg-slate-50 p-3 font-bold text-slate-700">{dayName}</td>
                  {PERIODS.map((period) => {
                    const e = at(day, period)
                    const content = e ? (
                      <div className={`flex h-full flex-col justify-center rounded-lg p-2 ring-1 ${colorOf(e.subjectId)}`}>
                        <p className="font-bold">{lookups.subject.get(e.subjectId)?.name ?? '—'}</p>
                        <p className="truncate text-xs opacity-80">
                          {mode === 'class'
                            ? (lookups.teacher.get(e.teacherId)?.name ?? 'بدون معلم')
                            : lookups.classRoom.get(e.classId)?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-300">
                        {mode === 'class' ? '+' : ''}
                      </div>
                    )
                    return (
                      <td key={period} className="h-20 border-t border-slate-100 p-1.5">
                        {mode === 'class' ? (
                          <button
                            className="h-full w-full transition hover:opacity-80"
                            onClick={() =>
                              setCell({
                                day,
                                period,
                                subjectId: e?.subjectId ?? data.subjects[0]?.id ?? '',
                                teacherId: e?.teacherId ?? '',
                              })
                            }
                          >
                            {content}
                          </button>
                        ) : (
                          content
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cell && (
        <Modal
          title={`${DAYS[cell.day]} — الحصة ${cell.period}`}
          onClose={() => setCell(null)}
          size="sm"
          footer={
            <>
              {at(cell.day, cell.period) && (
                <Button
                  variant="danger"
                  className="ml-auto"
                  onClick={() => {
                    setScheduleCell(selected, cell.day, cell.period, null)
                    setCell(null)
                  }}
                >
                  إفراغ الحصة
                </Button>
              )}
              <Button variant="secondary" onClick={() => setCell(null)}>
                إلغاء
              </Button>
              <Button
                disabled={!cell.subjectId}
                onClick={() => {
                  setScheduleCell(selected, cell.day, cell.period, { subjectId: cell.subjectId, teacherId: cell.teacherId })
                  setCell(null)
                }}
              >
                حفظ
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="المادة">
              <Select
                value={cell.subjectId}
                onChange={(e) => {
                  const subjectId = e.target.value
                  const first = data.teachers.find((t) => t.subjectIds.includes(subjectId))
                  setCell({ ...cell, subjectId, teacherId: first?.id ?? '' })
                }}
              >
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="المعلم">
              <Select value={cell.teacherId} onChange={(e) => setCell({ ...cell, teacherId: e.target.value })}>
                <option value="">— بدون معلم —</option>
                {(subjectTeachers.length ? subjectTeachers : data.teachers).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            {conflict && (
              <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                تعارض: هذا المعلم لديه حصة في {lookups.classRoom.get(conflict.classId)?.name} في نفس الوقت.
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
