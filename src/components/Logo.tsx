import { GraduationCap } from 'lucide-react'

export default function Logo({ name, light = false }: { name: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-sm">
        <GraduationCap className="h-6 w-6" />
      </div>
      <span className={`text-lg font-extrabold leading-tight ${light ? 'text-white' : 'text-slate-900'}`}>{name}</span>
    </div>
  )
}
