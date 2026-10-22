import { useRef, useState, type FormEvent } from 'react'
import { CheckCheck, Download, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { useStore, type Data } from '../../store'
import type { Settings } from '../../types'
import { downloadJSON, todayISO } from '../../lib/utils'
import { defaultSettings } from '../../data/seed'
import { FormFields, type FieldDef } from '../../components/EntityModal'
import { Button, Card, CardTitle, ConfirmDialog, PageHeader } from '../../components/ui'

const schoolFields: FieldDef<Settings>[] = [
  { key: 'schoolName', label: 'اسم المدرسة', required: true },
  { key: 'academicYear', label: 'العام الدراسي', required: true },
  { key: 'slogan', label: 'الشعار', full: true },
  { key: 'principal', label: 'مدير المدرسة' },
  { key: 'phone', label: 'الهاتف', type: 'tel' },
  { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
  { key: 'address', label: 'العنوان' },
  { key: 'about', label: 'نبذة عن المدرسة', type: 'textarea' },
]

const accountFields: FieldDef<Settings>[] = [
  { key: 'adminUsername', label: 'اسم المستخدم', required: true },
  { key: 'adminPassword', label: 'كلمة المرور', type: 'password', required: true },
]

export default function SettingsPage() {
  const { data, updateSettings, replaceAll, resetDemo, clearAll } = useStore()
  const [form, setForm] = useState<Settings>(data.settings)
  const [saved, setSaved] = useState(false)
  const [confirm, setConfirm] = useState<'reset' | 'clear' | null>(null)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const importFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Data
      const required: (keyof Data)[] = ['settings', 'students', 'teachers', 'classes', 'subjects', 'schedule', 'attendance', 'grades', 'news', 'messages']
      if (!required.every((k) => k in parsed)) throw new Error('invalid')
      replaceAll(parsed)
      setForm(parsed.settings)
      setImportMsg({ ok: true, text: 'تم استيراد البيانات بنجاح' })
    } catch {
      setImportMsg({ ok: false, text: 'الملف غير صالح' })
    }
  }

  return (
    <>
      <PageHeader title="الإعدادات" subtitle="بيانات المدرسة وحساب المدير والنسخ الاحتياطي" />
      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardTitle>بيانات المدرسة</CardTitle>
          <FormFields fields={schoolFields} value={form} onChange={setForm} />
        </Card>
        <Card>
          <CardTitle>حساب المدير</CardTitle>
          <FormFields fields={accountFields} value={form} onChange={setForm} />
        </Card>
        <div className="flex items-center gap-3">
          <Button type="submit">
            <Save className="h-4 w-4" />
            حفظ الإعدادات
          </Button>
          {saved && (
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCheck className="h-4 w-4" />
              تم الحفظ
            </span>
          )}
        </div>
      </form>

      <Card className="mt-6">
        <CardTitle>البيانات والنسخ الاحتياطي</CardTitle>
        <p className="mb-4 text-sm text-slate-500">
          تُحفظ جميع البيانات في متصفحك. صدّر نسخة احتياطية بانتظام لنقلها إلى جهاز آخر أو لاستعادتها لاحقاً.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadJSON(data, `school-backup-${todayISO()}.json`)}>
            <Download className="h-4 w-4" />
            تصدير نسخة احتياطية
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            استيراد نسخة
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importFile(f)
              e.target.value = ''
            }}
          />
          <Button variant="secondary" onClick={() => setConfirm('reset')}>
            <RotateCcw className="h-4 w-4" />
            استعادة البيانات التجريبية
          </Button>
          <Button variant="danger" onClick={() => setConfirm('clear')}>
            <Trash2 className="h-4 w-4" />
            حذف كل البيانات
          </Button>
        </div>
        {importMsg && (
          <p className={`mt-3 rounded-lg p-3 text-sm ${importMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{importMsg.text}</p>
        )}
      </Card>

      {confirm && (
        <ConfirmDialog
          title={confirm === 'reset' ? 'استعادة البيانات التجريبية' : 'حذف كل البيانات'}
          message={
            confirm === 'reset'
              ? 'سيتم استبدال جميع البيانات الحالية بالبيانات التجريبية. هل تريد المتابعة؟'
              : 'سيتم حذف جميع الطلاب والمعلمين والصفوف والعلامات والأخبار نهائياً (مع الإبقاء على الإعدادات). هل أنت متأكد؟'
          }
          confirmLabel={confirm === 'reset' ? 'استعادة' : 'حذف الكل'}
          onConfirm={() => {
            if (confirm === 'reset') {
              resetDemo()
              setForm({ ...defaultSettings })
            } else clearAll()
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )
}
