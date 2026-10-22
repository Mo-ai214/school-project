import type { AttendanceStatus, Grade } from '../types'

export const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
export const PERIODS = [1, 2, 3, 4, 5, 6, 7]
export const PERIOD_TIMES = [
  '7:30 - 8:15',
  '8:20 - 9:05',
  '9:10 - 9:55',
  '10:20 - 11:05',
  '11:10 - 11:55',
  '12:00 - 12:45',
  '12:50 - 1:35',
]
export const TERMS = [
  { value: 1, label: 'الفصل الأول' },
  { value: 2, label: 'الفصل الثاني' },
]
export const NEWS_CATEGORIES = ['أخبار', 'فعاليات', 'إعلانات', 'إنجازات']

export const categoryStyles: Record<string, string> = {
  أخبار: 'bg-indigo-100 text-indigo-700',
  فعاليات: 'bg-violet-100 text-violet-700',
  إعلانات: 'bg-amber-100 text-amber-700',
  إنجازات: 'bg-emerald-100 text-emerald-700',
}

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',
  excused: 'بعذر',
}

export const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-600 text-white border-emerald-600',
  absent: 'bg-rose-600 text-white border-rose-600',
  late: 'bg-amber-500 text-white border-amber-500',
  excused: 'bg-sky-600 text-white border-sky-600',
}

export const STATUS_BADGES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-rose-100 text-rose-700',
  late: 'bg-amber-100 text-amber-700',
  excused: 'bg-sky-100 text-sky-700',
}

export const GRADE_MAX = { classwork: 20, midterm: 30, final: 50 }

export function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const todayISO = () => toISODate(new Date())

export function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('ar-EG-u-nu-latn', {
    month: 'short',
    day: 'numeric',
  })
}

export function weekdayName(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' })
}

export function isSchoolDay(d: Date) {
  const day = d.getDay()
  return day !== 5 && day !== 6
}

export function lastSchoolDays(count: number, from = new Date()) {
  const days: string[] = []
  const d = new Date(from)
  while (days.length < count) {
    if (isSchoolDay(d)) days.unshift(toISODate(d))
    d.setDate(d.getDate() - 1)
  }
  return days
}

export const gradeTotal = (g: Pick<Grade, 'classwork' | 'midterm' | 'final'>) =>
  g.classwork + g.midterm + g.final

export function rating(total: number) {
  if (total >= 90) return { label: 'ممتاز', className: 'bg-emerald-100 text-emerald-700' }
  if (total >= 80) return { label: 'جيد جداً', className: 'bg-teal-100 text-teal-700' }
  if (total >= 70) return { label: 'جيد', className: 'bg-sky-100 text-sky-700' }
  if (total >= 50) return { label: 'مقبول', className: 'bg-amber-100 text-amber-700' }
  return { label: 'راسب', className: 'bg-rose-100 text-rose-700' }
}

export function average(nums: number[]) {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export const round1 = (n: number) => Math.round(n * 10) / 10

export function attendanceRate(statuses: AttendanceStatus[]) {
  if (!statuses.length) return 0
  const attended = statuses.filter((s) => s === 'present' || s === 'late').length
  return round1((attended / statuses.length) * 100)
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, 'ar')
