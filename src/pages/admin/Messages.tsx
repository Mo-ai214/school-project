import { useState } from 'react'
import { Mail, MailOpen, Phone, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import type { Message } from '../../types'
import { formatDate } from '../../lib/utils'
import { Badge, Card, ConfirmDialog, EmptyState, IconButton, PageHeader } from '../../components/ui'

export default function Messages() {
  const { data, update, remove } = useStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [deleting, setDeleting] = useState<Message | null>(null)
  const list = data.messages.filter((m) => filter === 'all' || !m.read).sort((a, b) => b.date.localeCompare(a.date))
  const unread = data.messages.filter((m) => !m.read).length

  return (
    <>
      <PageHeader
        title="الرسائل الواردة"
        subtitle={`رسائل نموذج "تواصل معنا" — ${unread} غير مقروءة`}
        actions={
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold ${filter === f ? 'bg-white shadow-sm' : 'text-slate-500'}`}
              >
                {f === 'all' ? 'الكل' : 'غير المقروءة'}
              </button>
            ))}
          </div>
        }
      />
      {list.length ? (
        <div className="space-y-4">
          {list.map((m) => (
            <Card key={m.id} className={m.read ? '' : 'border-indigo-200 bg-indigo-50/40'}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{m.subject}</h3>
                    {!m.read && <Badge className="bg-indigo-600 text-white">جديدة</Badge>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-indigo-600">
                      <Mail className="h-3.5 w-3.5" />
                      {m.email}
                    </a>
                    {m.phone && (
                      <span className="flex items-center gap-1" dir="ltr">
                        <Phone className="h-3.5 w-3.5" />
                        {m.phone}
                      </span>
                    )}
                    <span>{formatDate(m.date)}</span>
                  </p>
                </div>
                <div className="flex">
                  <IconButton
                    icon={m.read ? Mail : MailOpen}
                    label={m.read ? 'تعليم كغير مقروءة' : 'تعليم كمقروءة'}
                    tone="indigo"
                    onClick={() => update('messages', m.id, { read: !m.read })}
                  />
                  <IconButton icon={Trash2} label="حذف" tone="rose" onClick={() => setDeleting(m)} />
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">{m.body}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={Mail} text="لا توجد رسائل" />
        </Card>
      )}
      {deleting && (
        <ConfirmDialog message="هل تريد حذف هذه الرسالة؟" onConfirm={() => remove('messages', deleting.id)} onCancel={() => setDeleting(null)} />
      )}
    </>
  )
}
