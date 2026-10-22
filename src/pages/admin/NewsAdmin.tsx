import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import type { NewsItem } from '../../types'
import { NEWS_CATEGORIES, categoryStyles, formatDate, todayISO } from '../../lib/utils'
import { EntityModal, type FieldDef } from '../../components/EntityModal'
import { Badge, Button, Card, ConfirmDialog, EmptyState, IconButton, PageHeader } from '../../components/ui'

type NewsForm = Omit<NewsItem, 'id'> & { id?: string }

const fields: FieldDef<NewsForm>[] = [
  { key: 'title', label: 'العنوان', required: true, full: true },
  { key: 'category', label: 'التصنيف', type: 'select', options: NEWS_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: 'date', label: 'التاريخ', type: 'date', required: true },
  { key: 'summary', label: 'ملخص قصير', type: 'textarea', required: true },
  { key: 'body', label: 'نص الخبر', type: 'textarea', required: true },
]

export default function NewsAdmin() {
  const { data, add, update, remove } = useStore()
  const [editing, setEditing] = useState<NewsForm | null>(null)
  const [deleting, setDeleting] = useState<NewsItem | null>(null)
  const list = [...data.news].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHeader
        title="إدارة الأخبار"
        subtitle="الأخبار المنشورة تظهر مباشرة على موقع المدرسة"
        actions={
          <Button onClick={() => setEditing({ title: '', category: NEWS_CATEGORIES[0], date: todayISO(), summary: '', body: '' })}>
            <Plus className="h-4 w-4" />
            خبر جديد
          </Button>
        }
      />
      {list.length ? (
        <div className="space-y-4">
          {list.map((n) => (
            <Card key={n.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge className={categoryStyles[n.category]}>{n.category}</Badge>
                  <span className="text-sm text-slate-400">{formatDate(n.date)}</span>
                </div>
                <h3 className="text-lg font-bold">{n.title}</h3>
                <p className="line-clamp-1 text-slate-500">{n.summary}</p>
              </div>
              <div className="flex shrink-0">
                <Link to={`/news/${n.id}`} target="_blank" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="عرض">
                  <Eye className="h-4 w-4" />
                </Link>
                <IconButton icon={Pencil} label="تعديل" tone="indigo" onClick={() => setEditing(n)} />
                <IconButton icon={Trash2} label="حذف" tone="rose" onClick={() => setDeleting(n)} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={Newspaper} text="لا توجد أخبار منشورة" />
        </Card>
      )}
      {editing && (
        <EntityModal
          title={editing.id ? 'تعديل الخبر' : 'نشر خبر جديد'}
          fields={fields}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={({ id, ...rest }) => (id ? update('news', id, rest) : add('news', rest))}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={
            <>
              هل تريد حذف الخبر <b>{deleting.title}</b>؟
            </>
          }
          onConfirm={() => remove('news', deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
