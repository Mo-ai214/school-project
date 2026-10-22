import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { useStore } from '../../store'
import { categoryStyles, formatDate } from '../../lib/utils'
import NewsCard from './NewsCard'

export default function NewsDetail() {
  const { id } = useParams()
  const { data } = useStore()
  const item = data.news.find((n) => n.id === id)

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-800">الخبر غير موجود</h1>
        <Link to="/news" className="mt-4 inline-block font-bold text-indigo-600">
          العودة إلى الأخبار
        </Link>
      </div>
    )
  }

  const others = data.news
    .filter((n) => n.id !== item.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link to="/news" className="mb-6 inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="h-4 w-4 rotate-180" />
        كل الأخبار
      </Link>
      <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${categoryStyles[item.category] ?? 'bg-slate-100 text-slate-700'}`}>
            {item.category}
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <CalendarDays className="h-4 w-4" />
            {formatDate(item.date)}
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-extrabold text-slate-900">{item.title}</h1>
        <p className="mb-6 text-lg font-semibold text-slate-600">{item.summary}</p>
        <div className="whitespace-pre-line text-lg leading-9 text-slate-700">{item.body}</div>
      </article>
      {others.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-extrabold text-slate-900">أخبار أخرى</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {others.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
