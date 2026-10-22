import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createEmpty, createSeed } from './data/seed'
import { uid } from './lib/utils'
import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassRoom,
  Grade,
  Message,
  NewsItem,
  ScheduleEntry,
  Settings,
  Student,
  Subject,
  Teacher,
} from './types'

export type Collections = {
  students: Student[]
  teachers: Teacher[]
  classes: ClassRoom[]
  subjects: Subject[]
  schedule: ScheduleEntry[]
  attendance: AttendanceRecord[]
  grades: Grade[]
  news: NewsItem[]
  messages: Message[]
}
export type Data = Collections & { settings: Settings }
export type CollectionKey = keyof Collections
export type ItemOf<K extends CollectionKey> = Collections[K][number]

const STORAGE_KEY = 'school-project:data:v1'
const AUTH_KEY = 'school-project:auth'

function load(): Data {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Data
  } catch {
    // ignore corrupted storage and fall back to demo data
  }
  return createSeed()
}

interface Lookups {
  student: Map<string, Student>
  teacher: Map<string, Teacher>
  classRoom: Map<string, ClassRoom>
  subject: Map<string, Subject>
}

interface Store {
  data: Data
  lookups: Lookups
  add: <K extends CollectionKey>(key: K, item: Omit<ItemOf<K>, 'id'>) => ItemOf<K>
  update: <K extends CollectionKey>(key: K, id: string, patch: Partial<ItemOf<K>>) => void
  remove: (key: CollectionKey, id: string) => void
  setAttendance: (date: string, entries: { studentId: string; status: AttendanceStatus }[]) => void
  saveGrades: (rows: Omit<Grade, 'id'>[]) => void
  setScheduleCell: (
    classId: string,
    day: number,
    period: number,
    value: { subjectId: string; teacherId: string } | null,
  ) => void
  updateSettings: (patch: Partial<Settings>) => void
  replaceAll: (data: Data) => void
  resetDemo: () => void
  clearAll: () => void
  isAuthed: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load)
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    document.title = data.settings.schoolName
  }, [data.settings.schoolName])

  const lookups = useMemo<Lookups>(
    () => ({
      student: new Map(data.students.map((x) => [x.id, x])),
      teacher: new Map(data.teachers.map((x) => [x.id, x])),
      classRoom: new Map(data.classes.map((x) => [x.id, x])),
      subject: new Map(data.subjects.map((x) => [x.id, x])),
    }),
    [data.students, data.teachers, data.classes, data.subjects],
  )

  const add = useCallback(<K extends CollectionKey>(key: K, item: Omit<ItemOf<K>, 'id'>) => {
    const created = { ...item, id: uid() } as ItemOf<K>
    setData((d) => ({ ...d, [key]: [...d[key], created] }) as Data)
    return created
  }, [])

  const update = useCallback(<K extends CollectionKey>(key: K, id: string, patch: Partial<ItemOf<K>>) => {
    setData(
      (d) =>
        ({
          ...d,
          [key]: (d[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }) as Data,
    )
  }, [])

  const remove = useCallback((key: CollectionKey, id: string) => {
    setData((d) => {
      const next = { ...d, [key]: (d[key] as { id: string }[]).filter((x) => x.id !== id) } as Data
      if (key === 'students') {
        next.attendance = d.attendance.filter((a) => a.studentId !== id)
        next.grades = d.grades.filter((g) => g.studentId !== id)
      }
      if (key === 'classes') {
        next.schedule = d.schedule.filter((s) => s.classId !== id)
        next.students = d.students.map((s) => (s.classId === id ? { ...s, classId: '' } : s))
      }
      if (key === 'teachers') {
        next.schedule = d.schedule.map((s) => (s.teacherId === id ? { ...s, teacherId: '' } : s))
        next.classes = d.classes.map((c) => (c.homeroomTeacherId === id ? { ...c, homeroomTeacherId: '' } : c))
      }
      if (key === 'subjects') {
        next.schedule = d.schedule.filter((s) => s.subjectId !== id)
        next.grades = d.grades.filter((g) => g.subjectId !== id)
        next.teachers = d.teachers.map((t) => ({ ...t, subjectIds: t.subjectIds.filter((s) => s !== id) }))
      }
      return next
    })
  }, [])

  const setAttendance = useCallback((date: string, entries: { studentId: string; status: AttendanceStatus }[]) => {
    setData((d) => {
      const ids = new Set(entries.map((e) => e.studentId))
      const kept = d.attendance.filter((a) => !(a.date === date && ids.has(a.studentId)))
      return { ...d, attendance: [...kept, ...entries.map((e) => ({ ...e, date, id: uid() }))] }
    })
  }, [])

  const saveGrades = useCallback((rows: Omit<Grade, 'id'>[]) => {
    setData((d) => {
      const key = (g: Omit<Grade, 'id'>) => `${g.studentId}|${g.subjectId}|${g.term}`
      const incoming = new Set(rows.map(key))
      const kept = d.grades.filter((g) => !incoming.has(key(g)))
      return { ...d, grades: [...kept, ...rows.map((r) => ({ ...r, id: uid() }))] }
    })
  }, [])

  const setScheduleCell = useCallback(
    (classId: string, day: number, period: number, value: { subjectId: string; teacherId: string } | null) => {
      setData((d) => {
        const kept = d.schedule.filter((s) => !(s.classId === classId && s.day === day && s.period === period))
        return {
          ...d,
          schedule: value ? [...kept, { id: uid(), classId, day, period, ...value }] : kept,
        }
      })
    },
    [],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  const replaceAll = useCallback((next: Data) => setData(next), [])
  const resetDemo = useCallback(() => setData(createSeed()), [])
  const clearAll = useCallback(() => setData((d) => createEmpty(d.settings)), [])

  const login = useCallback(
    (username: string, password: string) => {
      const ok = username.trim() === data.settings.adminUsername && password === data.settings.adminPassword
      if (ok) {
        sessionStorage.setItem(AUTH_KEY, '1')
        setIsAuthed(true)
      }
      return ok
    },
    [data.settings.adminUsername, data.settings.adminPassword],
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY)
    setIsAuthed(false)
  }, [])

  const value: Store = {
    data,
    lookups,
    add,
    update,
    remove,
    setAttendance,
    saveGrades,
    setScheduleCell,
    updateSettings,
    replaceAll,
    resetDemo,
    clearAll,
    isAuthed,
    login,
    logout,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
