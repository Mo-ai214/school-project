import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GraduationCap, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import type { AttendanceStatus, Student } from '../../types'
import { attendanceRate, byName, todayISO } from '../../lib/utils'
import { EntityModal, type FieldDef } from '../../components/EntityModal'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Input,
  PageHeader,
  Select,
  tableClass,
  tableWrap,
  tdClass,
  thClass,
} from '../../components/ui'

type StudentForm = Omit<Student, 'id'> & { id?: string }

export default function Students() {
  const { data, lookups, add, update, remove } = useStore()
  const [params, setParams] = useSearchParams()
  const classFilter = params.get('class') ?? ''
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<StudentForm | null>(null)
  const [deleting, setDeleting] = useState<Student | null>(null)

  const q = query.trim()
  const list = data.students
    .filter((s) => !classFilter || s.classId === classFilter)
    .filter((s) => !q || s.name.includes(q) || s.code.includes(q) || s.guardianName.includes(q))
    .sort(byName)

  const nextCode = () => String(Math.max(new Date().getFullYear() * 1000, ...data.students.map((s) => Number(s.code) || 0)) + 1)

  const fields: FieldDef<StudentForm>[] = [
    { key: 'name', label: 'اسم الطالب الرباعي', required: true, full: true },
    { key: 'code', label: 'الرقم المدرسي', required: true },
    {
      key: 'gender',
      label: 'الجنس',
      type: 'select',
      options: [
        { value: 'ذكر', label: 'ذكر' },
        { value: 'أنثى', label: 'أنثى' },
      ],
    },
    { key: 'birthDate', label: 'تاريخ الميلاد', type: 'date' },
    {
      key: 'classId',
      label: 'الصف',
      type: 'select',
      options: [{ value: '', label: '— بدون صف —' }, ...data.classes.map((c) => ({ value: c.id, label: c.name }))],
    },
    { key: 'guardianName', label: 'اسم ولي الأمر', required: true },
    { key: 'guardianPhone', label: 'هاتف ولي الأمر', type: 'tel', required: true },
    { key: 'enrolledAt', label: 'تاريخ التسجيل', type: 'date' },
    { key: 'address', label: 'العنوان' },
  ]

  const attendanceByStudent = new Map<string, AttendanceStatus[]>()
  data.attendance.forEach((a) => {
    const arr = attendanceByStudent.get(a.studentId) ?? []
    arr.push(a.status)
    attendanceByStudent.set(a.studentId, arr)
  })

  return (
    <>
      <PageHeader
        title="الطلاب"
        subtitle={`إجمالي ${data.students.length} طالب وطالبة`}
        actions={
          <Button
            onClick={() =>
              setEditing({
                name: '',
                code: nextCode(),
                gender: 'ذكر',
                birthDate: '',
                classId: classFilter || data.classes[0]?.id || '',
                guardianName: '',
                guardianPhone: '',
                address: '',
                enrolledAt: todayISO(),
              })
            }
          >
            <Plus className="h-4 w-4" />
            إضافة طالب
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الرقم المدرسي أو ولي الأمر" className="pr-10" />
        </div>
        <Select
          value={classFilter}
          onChange={(e) => setParams(e.target.value ? { class: e.target.value } : {})}
          className="sm:w-56"
        >
          <option value="">كل الصفوف</option>
          {data.classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className={tableWrap}>
        {list.length ? (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>الرقم المدرسي</th>
                <th className={thClass}>الاسم</th>
                <th className={thClass}>الصف</th>
                <th className={thClass}>الجنس</th>
                <th className={thClass}>ولي الأمر</th>
                <th className={thClass}>الهاتف</th>
                <th className={thClass}>الحضور</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const rate = attendanceRate(attendanceByStudent.get(s.id) ?? [])
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className={`${tdClass} font-mono text-slate-500`}>{s.code}</td>
                    <td className={tdClass}>
                      <Link to={`/admin/students/${s.id}`} className="font-bold text-indigo-700 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className={tdClass}>{lookups.classRoom.get(s.classId)?.name ?? <span className="text-slate-400">—</span>}</td>
                    <td className={tdClass}>
                      <Badge className={s.gender === 'ذكر' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}>{s.gender}</Badge>
                    </td>
                    <td className={tdClass}>{s.guardianName}</td>
                    <td className={tdClass} dir="ltr">
                      {s.guardianPhone}
                    </td>
                    <td className={tdClass}>
                      <span className={rate >= 90 ? 'text-emerald-600' : rate >= 75 ? 'text-amber-600' : 'text-rose-600'}>{rate}%</span>
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
          <EmptyState icon={GraduationCap} text="لا يوجد طلاب مطابقون" />
        )}
      </div>

      {editing && (
        <EntityModal
          title={editing.id ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
          fields={fields}
          initial={editing}
          onClose={() => setEditing(null)}
          validate={(v) => {
            if (data.students.some((s) => s.code === v.code.trim() && s.id !== v.id)) return 'الرقم المدرسي مستخدم لطالب آخر'
            const cls = lookups.classRoom.get(v.classId)
            if (cls && v.classId !== lookups.student.get(v.id ?? '')?.classId) {
              const count = data.students.filter((s) => s.classId === cls.id).length
              if (count >= cls.capacity) return `الصف ${cls.name} ممتلئ (السعة ${cls.capacity})`
            }
            return null
          }}
          onSave={({ id, ...rest }) => {
            const value = { ...rest, code: rest.code.trim(), name: rest.name.trim() }
            if (id) update('students', id, value)
            else add('students', value)
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={
            <>
              هل أنت متأكد من حذف الطالب <b>{deleting.name}</b>؟ سيتم حذف سجلات الحضور والعلامات الخاصة به.
            </>
          }
          onConfirm={() => remove('students', deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
