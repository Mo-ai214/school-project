import { useState, type FormEvent } from 'react'
import { CheckCheck, Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useStore } from '../../store'
import { todayISO } from '../../lib/utils'
import { Button, Field, Input, Textarea } from '../../components/ui'

const empty = { name: '', email: '', phone: '', subject: '', body: '' }

export default function Contact() {
  const { data, add } = useStore()
  const { settings } = data
  const [form, setForm] = useState(empty)
  const [sent, setSent] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    add('messages', { ...form, date: todayISO(), read: false })
    setForm(empty)
    setSent(true)
  }

  const info = [
    { icon: MapPin, label: 'العنوان', value: settings.address },
    { icon: Phone, label: 'الهاتف', value: settings.phone, ltr: true },
    { icon: Mail, label: 'البريد الإلكتروني', value: settings.email },
    { icon: Clock, label: 'ساعات الدوام', value: 'الأحد - الخميس، 7:00 ص - 2:00 م' },
  ]

  return (
    <>
      <section className="bg-gradient-to-br from-indigo-700 to-violet-600 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold">تواصل معنا</h1>
        <p className="mt-3 text-indigo-100">يسعدنا استقبال استفساراتكم واقتراحاتكم</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3">
        <div className="space-y-4">
          {info.map((i) => (
            <div key={i.label} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <i.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{i.label}</p>
                <p className="font-bold text-slate-800" dir={i.ltr ? 'ltr' : undefined}>
                  {i.value}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2 md:p-8">
          <h2 className="mb-6 text-2xl font-extrabold text-slate-900">أرسل رسالة</h2>
          {sent && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-700">
              <CheckCheck className="h-5 w-5" />
              تم إرسال رسالتك بنجاح، سنتواصل معك قريباً.
            </div>
          )}
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم الكامل *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="البريد الإلكتروني *">
              <Input type="email" dir="ltr" className="text-right" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="رقم الهاتف">
              <Input type="tel" dir="ltr" className="text-right" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="الموضوع *">
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </Field>
            <Field label="الرسالة *" className="sm:col-span-2">
              <Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" className="px-8 py-3">
                <Send className="h-4 w-4" />
                إرسال
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
