import { useState } from 'react'
import { Newspaper } from 'lucide-react'
import { useStore } from '../../store'
import { NEWS_CATEGORIES } from '../../lib/utils'
import { EmptyState } from '../../components/ui'
import NewsCard from './NewsCard'

export default function News() {
  const { data } = useStore()
  const [category, setCategory] = useState('')
  const items = data.news
    .filter((n) => !category || n.category === category)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <section className="bg-gradient-to-br from-indigo-700 to-violet-600 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold">أخبار المدرسة</h1>
        <p className="mt-3 text-indigo-100">آخر المستجدات والفعاليات والإعلانات</p>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {['', ...NEWS_CATEGORIES].map((c) => (
            <button
              key={c || 'all'}
              onClick={() => setCategory(c)}
              className={`rounded-full px-5 py-2 font-semibold transition ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {c || 'الكل'}
            </button>
          ))}
        </div>
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Newspaper} text="لا توجد أخبار في هذا التصنيف" />
        )}
      </section>
    </>
  )
}
