import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import type { NewsItem } from '../../types'
import { categoryStyles, formatDate } from '../../lib/utils'


const gradients: Record<string, string> = {
  أخبار: 'from-indigo-500 to-sky-500',
  فعاليات: 'from-violet-500 to-fuchsia-500',
  إعلانات: 'from-amber-500 to-orange-500',
  إنجازات: 'from-emerald-500 to-teal-500',
}

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      to={`/news/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className={`flex h-36 items-end bg-gradient-to-br p-4 ${gradients[item.category] ?? 'from-slate-500 to-slate-700'}`}>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryStyles[item.category] ?? 'bg-slate-100 text-slate-700'}`}>
          {item.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
          <CalendarDays className="h-4 w-4" />
          {formatDate(item.date)}
        </p>
        <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-indigo-700">{item.title}</h3>
        <p className="line-clamp-3 leading-7 text-slate-500">{item.summary}</p>
      </div>
    </Link>
  )
}
