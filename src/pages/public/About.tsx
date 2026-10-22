import { BookOpen, Bus, Eye, FlaskConical, Heart, Library, Lightbulb, Monitor, Target, Trophy } from 'lucide-react'
import { useStore } from '../../store'

const pillars = [
  { icon: Eye, title: 'رؤيتنا', text: 'أن نكون مدرسة رائدة في إعداد جيل متعلم مبدع، معتز بهويته، ومنفتح على العالم.' },
  { icon: Target, title: 'رسالتنا', text: 'تقديم تعليم نوعي في بيئة آمنة ومحفزة، يكتشف قدرات الطلاب وينميها بالشراكة مع الأسرة والمجتمع.' },
  { icon: Heart, title: 'قيمنا', text: 'الاحترام، المسؤولية، التعاون، الإتقان، والتعلم المستمر.' },
]

const facilities = [
  { icon: FlaskConical, label: 'مختبرات العلوم' },
  { icon: Monitor, label: 'مختبر الحاسوب' },
  { icon: Library, label: 'مكتبة مدرسية' },
  { icon: Trophy, label: 'ملاعب رياضية' },
  { icon: Lightbulb, label: 'غرفة الابتكار' },
  { icon: Bus, label: 'نقل مدرسي' },
]

export default function About() {
  const { data } = useStore()
  const { settings } = data
  return (
    <>
      <section className="bg-gradient-to-br from-indigo-700 to-violet-600 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold">عن المدرسة</h1>
        <p className="mt-3 text-indigo-100">{settings.slogan}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold text-slate-900">من نحن</h2>
            <p className="text-lg leading-9 text-slate-600">{settings.about}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: data.students.length, l: 'طالب' },
              { v: data.teachers.length, l: 'معلم' },
              { v: data.classes.length, l: 'صف' },
              { v: data.subjects.length, l: 'مادة' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
                <p className="text-4xl font-extrabold text-indigo-600">{s.v}</p>
                <p className="mt-1 text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl bg-slate-50 p-8 text-center">
              <div className="mx-auto mb-4 inline-flex rounded-2xl bg-indigo-600 p-4 text-white">
                <p.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{p.title}</h3>
              <p className="leading-8 text-slate-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-slate-900">مرافق المدرسة</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {facilities.map((f) => (
            <div key={f.label} className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
              <f.icon className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
              <p className="font-semibold text-slate-700">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900">كلمة مدير المدرسة</h2>
          <p className="text-lg leading-9 text-slate-600">
            "نؤمن أن التعليم رحلة مشتركة بين المدرسة والطالب والأسرة. نسعى كل يوم لأن تكون مدرستنا بيتاً ثانياً لطلابنا، يتعلمون فيه
            المعرفة والقيم، ويكتشفون شغفهم، ويستعدون بثقة للمستقبل."
          </p>
          <p className="mt-4 font-bold text-indigo-700">{settings.principal}</p>
        </div>
      </section>
    </>
  )
}
