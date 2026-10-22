import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, FlaskConical, GraduationCap, Monitor, School, Shield, Trophy, Users } from 'lucide-react'
import { useStore } from '../../store'
import NewsCard from './NewsCard'

const features = [
  { icon: GraduationCap, title: 'كادر تعليمي مؤهل', text: 'معلمون ذوو خبرة وشهادات عليا يتابعون كل طالب بشكل فردي.' },
  { icon: FlaskConical, title: 'مختبرات حديثة', text: 'مختبرات علوم وحاسوب مجهزة بأحدث الأدوات للتعلم بالتجربة.' },
  { icon: Monitor, title: 'تعليم رقمي', text: 'فصول ذكية ومنصة إلكترونية لمتابعة الحضور والعلامات.' },
  { icon: Trophy, title: 'أنشطة وإنجازات', text: 'نوادٍ رياضية وفنية وعلمية ومشاركات متميزة في المسابقات.' },
  { icon: Shield, title: 'بيئة آمنة', text: 'بيئة مدرسية آمنة ومحفزة تحترم الطالب وتنمي شخصيته.' },
  { icon: Users, title: 'شراكة مع الأسرة', text: 'تواصل مستمر مع أولياء الأمور واجتماعات دورية.' },
]

export default function Home() {
  const { data } = useStore()
  const { settings } = data
  const latest = [...data.news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  const stats = [
    { label: 'طالب وطالبة', value: data.students.length, icon: GraduationCap },
    { label: 'معلم ومعلمة', value: data.teachers.length, icon: Users },
    { label: 'صف دراسي', value: data.classes.length, icon: School },
    { label: 'مادة دراسية', value: data.subjects.length, icon: BookOpen },
  ]

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 right-10 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-semibold">
              التسجيل مفتوح للعام الدراسي {settings.academicYear}
            </span>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">{settings.schoolName}</h1>
            <p className="mt-4 text-xl text-indigo-100">{settings.slogan}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50">
                تعرف علينا
              </Link>
              <Link to="/results" className="rounded-xl border border-white/40 px-6 py-3 font-bold transition hover:bg-white/10">
                استعلام النتائج
              </Link>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                  <s.icon className="mx-auto mb-2 h-8 w-8 text-indigo-200" />
                  <p className="text-3xl font-extrabold">{s.value}</p>
                  <p className="text-indigo-100">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-6xl grid-cols-2 gap-4 px-4 md:hidden">
        {stats.map((s) => (
          <div key={s.label} className="relative rounded-2xl bg-white p-4 text-center shadow-lg">
            <p className="text-2xl font-extrabold text-indigo-700">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">لماذا تختار مدرستنا؟</h2>
          <p className="mt-2 text-slate-500">نوفر تجربة تعليمية متكاملة تجمع بين التميز الأكاديمي وبناء الشخصية</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="leading-7 text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">آخر الأخبار</h2>
              <p className="mt-2 text-slate-500">تابع أحدث أخبار وفعاليات المدرسة</p>
            </div>
            <Link to="/news" className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800">
              كل الأخبار
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-slate-900 p-10 text-center text-white md:flex-row md:text-right">
          <div>
            <h2 className="text-2xl font-extrabold">هل لديك استفسار عن التسجيل؟</h2>
            <p className="mt-2 text-slate-300">فريقنا جاهز للإجابة عن جميع أسئلتك</p>
          </div>
          <Link to="/contact" className="rounded-xl bg-indigo-600 px-6 py-3 font-bold transition hover:bg-indigo-500">
            تواصل معنا
          </Link>
        </div>
      </section>
    </>
  )
}
