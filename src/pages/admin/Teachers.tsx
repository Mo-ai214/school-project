import { useState } from 'react'
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { useStore } from '../../store'
import type { Teacher } from '../../types'
import { byName, todayISO } from '../../lib/utils'
import { EntityModal, type FieldDef } from '../../components/EntityModal'
import { Badge, Button, ConfirmDialog, EmptyState, IconButton, Input, PageHeader, tableClass, tableWrap, tdClass, thClass } from '../../components/ui'

type TeacherForm = Omit<Teacher, 'id'> & { id?: string }

const fields: FieldDef<TeacherForm>[] = [
  { key: 'name', label: 'اسم المعلم', required: true, full: true },
  {
    key: 'gender',
    label: 'الجنس',
    type: 'select',
    options: [
      { value: 'ذكر', label: 'ذكر' },
      { value: 'أنثى', label: 'أنثى' },
    ],
  },
  { key: 'qualification', label: 'المؤهل العلمي' },
  { key: 'phone', label: 'الهاتف', type: 'tel', required: true },
  { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
  { key: 'hireDate', label: 'تاريخ التعيين', type: 'date' },
]

export default function Teachers() {
  const { data, lookups, add, update, remove } = useStore()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<TeacherForm | null>(null)
  const [deleting, setDeleting] = useState<Teacher | null>(null)

  const q = query.trim()
  const list = data.teachers
    .filter((t) => !q || t.name.includes(q) || t.subjectIds.some((s) => lookups.subject.get(s)?.name.includes(q)))
    .sort(byName)

  return (
    <>
      <PageHeader
        title="المعلمون"
        subtitle={`إجمالي ${data.teachers.length} معلم ومعلمة`}
        actions={
          <Button
            onClick={() =>
              setEditing({ name: '', gender: 'ذكر', phone: '', email: '', qualification: '', hireDate: todayISO(), subjectIds: [] })
            }
          >
            <Plus className="h-4 w-4" />
            إضافة معلم
          </Button>
        }
      />
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو المادة" className="pr-10" />
      </div>
      <div className={tableWrap}>
        {list.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>الاسم</th>
                <th className={thClass}>المواد</th>
                <th className={thClass}>المؤهل</th>
                <th className={thClass}>الهاتف</th>
                <th className={thClass}>البريد</th>
                <th className={thClass}>الحصص الأسبوعية</th>
                <th className={thClass}>رائد صف</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const homeroom = data.classes.find((c) => c.homeroomTeacherId === t.id)
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className={`${tdClass} font-bold`}>{t.name}</td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {t.subjectIds.map((s) => (
                          <Badge key={s} className="bg-violet-50 text-violet-700">
                            {lookups.subject.get(s)?.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className={tdClass}>{t.qualification}</td>
                    <td className={tdClass} dir="ltr">
                      {t.phone}
                    </td>
                    <td className={`${tdClass} text-slate-500`}>{t.email}</td>
                    <td className={tdClass}>{data.schedule.filter((e) => e.teacherId === t.id).length}</td>
                    <td className={tdClass}>{homeroom?.name ?? '—'}</td>
                    <td className={`${tdClass} text-left`}>
                      <IconButton icon={Pencil} label="تعديل" tone="indigo" onClick={() => setEditing(t)} />
                      <IconButton icon={Trash2} label="حذف" tone="rose" onClick={() => setDeleting(t)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={Users} text="لا يوجد معلمون" />
        )}
      </div>

      {editing && (
        <EntityModal
          title={editing.id ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
          fields={fields}
          initial={editing}
          onClose={() => setEditing(null)}
          validate={(v) => (v.subjectIds.length ? null : 'اختر مادة واحدة على الأقل')}
          onSave={({ id, ...rest }) => (id ? update('teachers', id, rest) : add('teachers', rest))}
          renderExtra={(v, set) => (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-600">المواد التي يدرّسها *</p>
              <div className="flex flex-wrap gap-2">
                {data.subjects.map((s) => {
                  const active = v.subjectIds.includes(s.id)
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() =>
                        set({ ...v, subjectIds: active ? v.subjectIds.filter((x) => x !== s.id) : [...v.subjectIds, s.id] })
                      }
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                        active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={
            <>
              هل أنت متأكد من حذف المعلم <b>{deleting.name}</b>؟ ستصبح حصصه في الجدول بدون معلم.
            </>
          }
          onConfirm={() => remove('teachers', deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
