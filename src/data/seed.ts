import type { Data } from '../store'
import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassRoom,
  Gender,
  Grade,
  Message,
  NewsItem,
  ScheduleEntry,
  Settings,
  Student,
  Subject,
  Teacher,
} from '../types'
import { DAYS, PERIODS, lastSchoolDays, toISODate } from '../lib/utils'

function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const maleNames = ['محمد', 'أحمد', 'علي', 'عمر', 'خالد', 'يوسف', 'إبراهيم', 'حسن', 'سامي', 'كريم', 'زياد', 'مازن', 'فيصل', 'طارق', 'ياسر', 'بلال', 'حمزة', 'أنس', 'مالك', 'سليم']
const femaleNames = ['فاطمة', 'مريم', 'سارة', 'نور', 'ليلى', 'هدى', 'رنا', 'جنى', 'لين', 'ريم', 'دانة', 'سلمى', 'آية', 'ملك', 'تالا', 'هبة', 'رهف', 'شهد', 'غنى', 'ياسمين']
const families = ['الأحمد', 'العلي', 'الحسن', 'الخطيب', 'السيد', 'النجار', 'الحداد', 'الشامي', 'المصري', 'العمر', 'الزعبي', 'القاسم', 'الرفاعي', 'البكري', 'الصالح', 'الحلبي', 'العطار', 'الكردي', 'الحمدان', 'الناصر']
const streets = ['حي النخيل', 'حي الربيع', 'حي الياسمين', 'حي الزهور', 'حي الروضة', 'حي السلام']

const subjectSeeds: [string, string, number][] = [
  ['اللغة العربية', 'AR', 6],
  ['الرياضيات', 'MATH', 6],
  ['اللغة الإنجليزية', 'EN', 5],
  ['العلوم', 'SCI', 4],
  ['التربية الإسلامية', 'ISL', 3],
  ['الدراسات الاجتماعية', 'SOC', 3],
  ['الحاسوب', 'CS', 2],
  ['التربية الرياضية', 'PE', 2],
  ['التربية الفنية', 'ART', 1],
]

const teacherSeeds: [string, Gender, string[], string][] = [
  ['أحمد محمود الخطيب', 'ذكر', ['AR'], 'ماجستير لغة عربية'],
  ['هدى سليم النجار', 'أنثى', ['AR'], 'بكالوريوس لغة عربية'],
  ['خالد يوسف الحداد', 'ذكر', ['MATH'], 'ماجستير رياضيات'],
  ['ريم عادل الشامي', 'أنثى', ['MATH'], 'بكالوريوس رياضيات'],
  ['سامر علي القاسم', 'ذكر', ['EN'], 'بكالوريوس أدب إنجليزي'],
  ['لينا فؤاد المصري', 'أنثى', ['EN'], 'ماجستير لغويات تطبيقية'],
  ['مازن حسن الرفاعي', 'ذكر', ['SCI'], 'بكالوريوس علوم حياتية'],
  ['سارة نبيل البكري', 'أنثى', ['SCI'], 'ماجستير كيمياء'],
  ['عمر إبراهيم الصالح', 'ذكر', ['ISL'], 'بكالوريوس شريعة'],
  ['منى خليل الحلبي', 'أنثى', ['SOC'], 'بكالوريوس تاريخ وجغرافيا'],
  ['طارق زياد العطار', 'ذكر', ['CS', 'ART'], 'بكالوريوس هندسة حاسوب'],
  ['فيصل ماجد الكردي', 'ذكر', ['PE'], 'بكالوريوس تربية رياضية'],
]

const classSeeds: [string, number, string][] = [
  ['السابع - أ', 7, 'أ'],
  ['السابع - ب', 7, 'ب'],
  ['الثامن - أ', 8, 'أ'],
  ['الثامن - ب', 8, 'ب'],
  ['التاسع - أ', 9, 'أ'],
  ['التاسع - ب', 9, 'ب'],
]

export const defaultSettings: Settings = {
  schoolName: 'مدرسة المستقبل النموذجية',
  slogan: 'نبني جيلاً واعياً، مبدعاً، ومستعداً للمستقبل',
  about:
    'مدرسة المستقبل النموذجية مؤسسة تعليمية تأسست عام 2005، تقدم تعليماً متميزاً للمرحلة المتوسطة في بيئة آمنة ومحفزة. نؤمن بأن كل طالب يملك قدرات فريدة، ونعمل مع الأسرة على تنميتها من خلال مناهج حديثة وكادر تعليمي مؤهل وأنشطة لا صفية متنوعة.',
  principal: 'أ. يوسف عبد الله الناصر',
  address: 'شارع العلم، حي الروضة، المدينة',
  phone: '0100 000 0000',
  email: 'info@future-school.edu',
  academicYear: '2026 / 2027',
  adminUsername: 'admin',
  adminPassword: 'admin123',
}

export function createSeed(): Data {
  const random = createRandom(2026)
  const pick = <T,>(arr: T[]) => arr[Math.floor(random() * arr.length)]
  const id = (prefix: string, n: number) => `${prefix}-${n}`
  const today = new Date()
  const daysAgo = (n: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return toISODate(d)
  }

  const subjects: Subject[] = subjectSeeds.map(([name, code, weeklyHours], i) => ({
    id: id('sub', i + 1),
    name,
    code,
    weeklyHours,
  }))
  const subjectByCode = Object.fromEntries(subjects.map((s) => [s.code, s.id]))

  const teachers: Teacher[] = teacherSeeds.map(([name, gender, codes, qualification], i) => ({
    id: id('tch', i + 1),
    name,
    gender,
    phone: `05${String(10000000 + Math.floor(random() * 89999999))}`,
    email: `teacher${i + 1}@future-school.edu`,
    qualification,
    hireDate: `${2010 + Math.floor(random() * 15)}-0${1 + Math.floor(random() * 8)}-01`,
    subjectIds: codes.map((c) => subjectByCode[c]),
  }))

  const classes: ClassRoom[] = classSeeds.map(([name, grade, section], i) => ({
    id: id('cls', i + 1),
    name,
    grade,
    section,
    room: `${100 + (i + 1) * 2}`,
    capacity: 30,
    homeroomTeacherId: teachers[i].id,
  }))

  const students: Student[] = []
  const year = today.getFullYear()
  classes.forEach((c) => {
    for (let i = 0; i < 20; i++) {
      const gender: Gender = random() < 0.5 ? 'ذكر' : 'أنثى'
      const first = gender === 'ذكر' ? pick(maleNames) : pick(femaleNames)
      const father = pick(maleNames)
      const family = pick(families)
      const birthYear = year - (c.grade + 6)
      students.push({
        id: id('std', students.length + 1),
        code: String(year * 1000 + students.length + 1),
        name: `${first} ${father} ${family}`,
        gender,
        birthDate: `${birthYear}-${String(1 + Math.floor(random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(random() * 28)).padStart(2, '0')}`,
        classId: c.id,
        guardianName: `${father} ${pick(maleNames)} ${family}`,
        guardianPhone: `05${String(10000000 + Math.floor(random() * 89999999))}`,
        address: `${pick(streets)}، المدينة`,
        enrolledAt: `${year - (c.grade - 6)}-09-01`,
      })
    }
  })

  const schedule: ScheduleEntry[] = []
  const busy = new Set<string>()
  classes.forEach((c) => {
    const remaining = subjects.flatMap((s) => Array<string>(s.weeklyHours).fill(s.id))
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[remaining[i], remaining[j]] = [remaining[j], remaining[i]]
    }
    DAYS.forEach((_, day) => {
      PERIODS.forEach((period) => {
        if (!remaining.length) return
        const usedToday = schedule.filter((e) => e.classId === c.id && e.day === day).map((e) => e.subjectId)
        let chosen: { index: number; teacherId: string } | null = null
        for (const pass of [0, 1]) {
          for (let k = 0; k < remaining.length && !chosen; k++) {
            const subjectId = remaining[k]
            if (pass === 0 && usedToday.filter((s) => s === subjectId).length >= 2) continue
            const free = teachers.find(
              (t) => t.subjectIds.includes(subjectId) && !busy.has(`${t.id}-${day}-${period}`),
            )
            if (free) chosen = { index: k, teacherId: free.id }
          }
          if (chosen) break
        }
        if (!chosen) return
        const [subjectId] = remaining.splice(chosen.index, 1)
        busy.add(`${chosen.teacherId}-${day}-${period}`)
        schedule.push({ id: id('sch', schedule.length + 1), classId: c.id, day, period, subjectId, teacherId: chosen.teacherId })
      })
    })
  })

  const attendance: AttendanceRecord[] = []
  lastSchoolDays(10, today).forEach((date) => {
    students.forEach((s) => {
      const r = random()
      const status: AttendanceStatus = r < 0.9 ? 'present' : r < 0.95 ? 'absent' : r < 0.98 ? 'late' : 'excused'
      attendance.push({ id: id('att', attendance.length + 1), date, studentId: s.id, status })
    })
  })

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
  const grades: Grade[] = []
  students.forEach((s) => {
    const ability = 50 + random() * 48
    subjects.forEach((sub) => {
      const pct = clamp(ability + (random() - 0.5) * 22, 25, 100) / 100
      const part = (max: number) => clamp(Math.round(max * clamp(pct + (random() - 0.5) * 0.12, 0, 1)), 0, max)
      grades.push({
        id: id('grd', grades.length + 1),
        studentId: s.id,
        subjectId: sub.id,
        term: 1,
        classwork: part(20),
        midterm: part(30),
        final: part(50),
      })
    })
  })

  const news: NewsItem[] = [
    {
      id: id('nws', 1),
      title: 'انطلاق العام الدراسي الجديد',
      category: 'أخبار',
      date: daysAgo(40),
      summary: 'استقبلت المدرسة طلابها بحفل ترحيبي وبرنامج تعريفي للطلاب الجدد.',
      body: 'استقبلت مدرسة المستقبل النموذجية طلابها مع انطلاق العام الدراسي الجديد بحفل ترحيبي حضره أولياء الأمور والكادر التعليمي. تضمن البرنامج جولة تعريفية في مرافق المدرسة للطلاب الجدد، وتوزيع الكتب والجداول الدراسية، إضافة إلى لقاء مفتوح مع إدارة المدرسة للإجابة عن استفسارات الأسر.',
    },
    {
      id: id('nws', 2),
      title: 'المركز الأول في مسابقة الروبوت',
      category: 'إنجازات',
      date: daysAgo(18),
      summary: 'فريق المدرسة يحصد المركز الأول في مسابقة الروبوت على مستوى المدينة.',
      body: 'حقق فريق الروبوت في المدرسة المركز الأول في المسابقة السنوية للروبوت على مستوى المدينة بمشاركة أكثر من 30 مدرسة. صمم الفريق روبوتاً قادراً على فرز النفايات القابلة لإعادة التدوير. تتقدم إدارة المدرسة بالتهنئة للطلاب ومشرفهم على هذا الإنجاز المميز.',
    },
    {
      id: id('nws', 3),
      title: 'اجتماع أولياء الأمور',
      category: 'إعلانات',
      date: daysAgo(7),
      summary: 'دعوة لحضور اجتماع أولياء الأمور لمناقشة نتائج الفصل الأول.',
      body: 'تدعو إدارة المدرسة أولياء الأمور لحضور الاجتماع الدوري يوم الخميس القادم الساعة الخامسة مساءً في قاعة المدرسة، لمناقشة نتائج اختبارات منتصف الفصل وخطط الدعم الأكاديمي. يمكن الاطلاع على نتائج الطلاب مسبقاً من خلال صفحة استعلام النتائج على الموقع.',
    },
    {
      id: id('nws', 4),
      title: 'اليوم العلمي المفتوح',
      category: 'فعاليات',
      date: daysAgo(3),
      summary: 'معرض لمشاريع الطلاب العلمية بمشاركة جميع الصفوف.',
      body: 'نظمت المدرسة اليوم العلمي المفتوح الذي عرض فيه الطلاب أكثر من 40 مشروعاً علمياً في مجالات الفيزياء والكيمياء والأحياء والبرمجة. شهد المعرض حضوراً واسعاً من أولياء الأمور، وتم تكريم أفضل خمسة مشاريع.',
    },
    {
      id: id('nws', 5),
      title: 'بدء التسجيل في الأنشطة اللاصفية',
      category: 'إعلانات',
      date: daysAgo(1),
      summary: 'التسجيل مفتوح في نوادي الرياضة والفنون والبرمجة والقراءة.',
      body: 'تعلن المدرسة عن بدء التسجيل في الأنشطة اللاصفية للفصل الحالي، وتشمل: نادي كرة القدم، نادي الرسم، نادي البرمجة، نادي القراءة، ونادي الخطابة. يتم التسجيل عن طريق رائد الصف حتى نهاية الأسبوع.',
    },
  ]

  const messages: Message[] = [
    {
      id: id('msg', 1),
      name: 'عبد الرحمن الحمدان',
      email: 'parent1@example.com',
      phone: '0551234567',
      subject: 'استفسار عن التسجيل',
      body: 'السلام عليكم، أرغب بتسجيل ابني في الصف السابع للعام القادم، ما هي الأوراق المطلوبة؟',
      date: daysAgo(2),
      read: false,
    },
    {
      id: id('msg', 2),
      name: 'نادية العمر',
      email: 'parent2@example.com',
      phone: '0559876543',
      subject: 'شكر وتقدير',
      body: 'أشكر إدارة المدرسة والمعلمين على الجهود المبذولة في اليوم العلمي، كانت تجربة رائعة لابنتي.',
      date: daysAgo(4),
      read: true,
    },
  ]

  return {
    settings: { ...defaultSettings },
    subjects,
    teachers,
    classes,
    students,
    schedule,
    attendance,
    grades,
    news,
    messages,
  }
}

export function createEmpty(settings: Settings): Data {
  return {
    settings,
    subjects: [],
    teachers: [],
    classes: [],
    students: [],
    schedule: [],
    attendance: [],
    grades: [],
    news: [],
    messages: [],
  }
}
