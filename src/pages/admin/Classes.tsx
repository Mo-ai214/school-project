import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, DoorOpen, GraduationCap, Pencil, Plus, School, Trash2, User } from 'lucide-react'
import { useStore } from '../../store'
import type { ClassRoom } from '../../types'
import { EntityModal, type FieldDef } from '../../components/EntityModal'
import { Button, Card, ConfirmDialog, EmptyState, IconButton, PageHeader } from '../../components/ui'

type ClassForm = Omit<ClassRoom, 'id'> & { id?: string }

export default function Classes() {
  const { data, lookups, add, update, remove } = useStore()
  const [editing, setEditing] = useState<ClassForm | null>(null)
  const [deleting, setDeleting] = useState<ClassRoom | null>(null)

  const fields: FieldDef<ClassForm>[] = [
    { key: 'name', label: 'اسم الصف', required: true, placeholder: 'مثال: السابع - أ' },
    { key: 'grade', label: 'المستوى (رقم الصف)', type: 'number', min: 1, max: 12, required: true },
    { key: 'section', label: 'الشعبة', required: true },
    { key: 'room', label: 'رقم الغرفة' },
    { key: 'capacity', label: 'السعة القصوى', type: 'number', min: 1, required: true },
    {
      key: 'homeroomTeacherId',
      label: 'رائد الصف',
      type: 'select',
      options: [{ value: '', label: '— لم يحدد —' }, ...data.teachers.map((t) => ({ value: t.id, label: t.name }))],
    },
  ]

  const list = [...data.classes].sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section, 'ar'))

  return (
    <>
      <PageHeader
        title="الصفوف"
        subtitle={`${data.classes.length} صفوف دراسية`}
        actions={
          <Button onClick={() => setEditing({ name: '', grade: 7, section: '', room: '', capacity: 30, homeroomTeacherId: '' })}>
            <Plus className="h-4 w-4" />
            إضافة صف
          </Button>
        }
      />
      {list.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const count = data.students.filter((s) => s.classId === c.id).length
            const pct = Math.min(100, Math.round((count / Math.max(1, c.capacity)) * 100))
            return (
              <Card key={c.id} className="flex flex-col">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                      <School className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{c.name}</h3>
                      <p className="text-sm text-slate-500">الصف {c.grade} — شعبة {c.section}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <IconButton icon={Pencil} label="تعديل" tone="indigo" onClick={() => setEditing(c)} />
                    <IconButton icon={Trash2} label="حذف" tone="rose" onClick={() => setDeleting(c)} />
                  </div>
                </div>
                <div className="mb-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    رائد الصف: <b>{lookups.teacher.get(c.homeroomTeacherId)?.name ?? '—'}</b>
                  </p>
                  <p className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-slate-400" />
                    الغرفة: <b>{c.room || '—'}</b>
                  </p>
                </div>
                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-500">الطلاب</span>
                    <span className="font-bold">
                      {count} / {c.capacity}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Link
                    to={`/admin/students?class=${c.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <GraduationCap className="h-4 w-4" />
                    الطلاب
                  </Link>
                  <Link
                    to={`/admin/schedule?class=${c.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <CalendarDays className="h-4 w-4" />
                    الجدول
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState icon={School} text="لا توجد صفوف بعد" />
        </Card>
      )}

      {editing && (
        <EntityModal
          title={editing.id ? 'تعديل الصف' : 'إضافة صف جديد'}
          fields={fields}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={({ id, ...rest }) => (id ? update('classes', id, rest) : add('classes', rest))}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={
            <>
              هل أنت متأكد من حذف الصف <b>{deleting.name}</b>؟ سيتم حذف جدوله وسيصبح طلابه بدون صف.
            </>
          }
          onConfirm={() => remove('classes', deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
