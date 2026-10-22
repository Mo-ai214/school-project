import { useState } from 'react'
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import type { Subject } from '../../types'
import { EntityModal, type FieldDef } from '../../components/EntityModal'
import { Badge, Button, ConfirmDialog, EmptyState, IconButton, PageHeader, tableClass, tableWrap, tdClass, thClass } from '../../components/ui'

type SubjectForm = Omit<Subject, 'id'> & { id?: string }

const fields: FieldDef<SubjectForm>[] = [
  { key: 'name', label: 'اسم المادة', required: true, full: true },
  { key: 'code', label: 'رمز المادة', required: true },
  { key: 'weeklyHours', label: 'عدد الحصص الأسبوعية', type: 'number', min: 1, max: 10, required: true },
]

export default function Subjects() {
  const { data, add, update, remove } = useStore()
  const [editing, setEditing] = useState<SubjectForm | null>(null)
  const [deleting, setDeleting] = useState<Subject | null>(null)
  const totalHours = data.subjects.reduce((a, s) => a + s.weeklyHours, 0)

  return (
    <>
      <PageHeader
        title="المواد الدراسية"
        subtitle={`${data.subjects.length} مادة — ${totalHours} حصة أسبوعياً لكل صف`}
        actions={
          <Button onClick={() => setEditing({ name: '', code: '', weeklyHours: 2 })}>
            <Plus className="h-4 w-4" />
            إضافة مادة
          </Button>
        }
      />
      <div className={tableWrap}>
        {data.subjects.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>المادة</th>
                <th className={thClass}>الرمز</th>
                <th className={thClass}>الحصص الأسبوعية</th>
                <th className={thClass}>المعلمون</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((s) => {
                const teachers = data.teachers.filter((t) => t.subjectIds.includes(s.id))
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className={`${tdClass} font-bold`}>{s.name}</td>
                    <td className={tdClass}>
                      <Badge className="bg-slate-100 font-mono text-slate-700">{s.code}</Badge>
                    </td>
                    <td className={tdClass}>{s.weeklyHours}</td>
                    <td className={tdClass}>
                      {teachers.length ? teachers.map((t) => t.name).join('، ') : <span className="text-rose-500">لا يوجد معلم</span>}
                    </td>
                    <td className={`${tdClass} text-left`}>
                      <IconButton icon={Pencil} label="تعديل" tone="indigo" onClick={() => setEditing(s)} />
                      <IconButton icon={Trash2} label="حذف" tone="rose" onClick={() => setDeleting(s)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={BookOpen} text="لا توجد مواد بعد" />
        )}
      </div>
      {editing && (
        <EntityModal
          title={editing.id ? 'تعديل المادة' : 'إضافة مادة جديدة'}
          fields={fields}
          initial={editing}
          onClose={() => setEditing(null)}
          validate={(v) =>
            data.subjects.some((s) => s.code.toLowerCase() === v.code.trim().toLowerCase() && s.id !== v.id) ? 'رمز المادة مستخدم مسبقاً' : null
          }
          onSave={({ id, ...rest }) => {
            const value = { ...rest, code: rest.code.trim().toUpperCase() }
            if (id) update('subjects', id, value)
            else add('subjects', value)
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={
            <>
              هل أنت متأكد من حذف مادة <b>{deleting.name}</b>؟ سيتم حذف حصصها من الجدول وجميع علاماتها.
            </>
          }
          onConfirm={() => remove('subjects', deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
