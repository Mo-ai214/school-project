export type Gender = 'ذكر' | 'أنثى'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface Student {
  id: string
  code: string
  name: string
  gender: Gender
  birthDate: string
  classId: string
  guardianName: string
  guardianPhone: string
  address: string
  enrolledAt: string
}

export interface Teacher {
  id: string
  name: string
  gender: Gender
  phone: string
  email: string
  qualification: string
  hireDate: string
  subjectIds: string[]
}

export interface ClassRoom {
  id: string
  name: string
  grade: number
  section: string
  room: string
  capacity: number
  homeroomTeacherId: string
}

export interface Subject {
  id: string
  name: string
  code: string
  weeklyHours: number
}

export interface ScheduleEntry {
  id: string
  classId: string
  day: number
  period: number
  subjectId: string
  teacherId: string
}

export interface AttendanceRecord {
  id: string
  date: string
  studentId: string
  status: AttendanceStatus
}

export interface Grade {
  id: string
  studentId: string
  subjectId: string
  term: number
  classwork: number
  midterm: number
  final: number
}

export interface NewsItem {
  id: string
  title: string
  category: string
  date: string
  summary: string
  body: string
}

export interface Message {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  body: string
  date: string
  read: boolean
}

export interface Settings {
  schoolName: string
  slogan: string
  about: string
  principal: string
  address: string
  phone: string
  email: string
  academicYear: string
  adminUsername: string
  adminPassword: string
}
