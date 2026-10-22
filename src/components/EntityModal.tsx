import { useState, type FormEvent, type ReactNode } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from './ui'

export type FieldDef<T> = {
  key: keyof T & string
  label: string
  type?: 'text' | 'number' | 'date' | 'email' | 'tel' | 'select' | 'textarea' | 'password'
  options?: { value: string | number; label: string }[]
  required?: boolean
  full?: boolean
  min?: number
  max?: number
  placeholder?: string
}

export function FormFields<T extends object>({
  fields,
  value,
  onChange,
}: {
  fields: FieldDef<T>[]
  value: T
  onChange: (v: T) => void
}) {
  const record = value as Record<string, unknown>
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const current = (record[f.key] ?? '') as string | number
        const set = (raw: string) => onChange({ ...value, [f.key]: f.type === 'number' ? Number(raw) : raw })
        const common = { required: f.required, placeholder: f.placeholder }
        return (
          <Field key={f.key} label={f.label + (f.required ? ' *' : '')} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            {f.type === 'select' ? (
              <Select value={current} onChange={(e) => set(e.target.value)} {...common}>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : f.type === 'textarea' ? (
              <Textarea value={current} onChange={(e) => set(e.target.value)} {...common} />
            ) : (
              <Input
                type={f.type ?? 'text'}
                value={current}
                min={f.min}
                max={f.max}
                onChange={(e) => set(e.target.value)}
                dir={f.type === 'email' || f.type === 'tel' ? 'ltr' : undefined}
                className={f.type === 'email' || f.type === 'tel' ? 'text-right' : ''}
                {...common}
              />
            )}
          </Field>
        )
      })}
    </div>
  )
}

export function EntityModal<T extends object>({
  title,
  fields,
  initial,
  onClose,
  onSave,
  validate,
  renderExtra,
}: {
  title: string
  fields: FieldDef<T>[]
  initial: T
  onClose: () => void
  onSave: (value: T) => void
  validate?: (value: T) => string | null
  renderExtra?: (value: T, setValue: (v: T) => void) => ReactNode
}) {
  const [value, setValue] = useState<T>(initial)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const problem = validate?.(value) ?? null
    if (problem) {
      setError(problem)
      return
    }
    onSave(value)
    onClose()
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <FormFields fields={fields} value={value} onChange={setValue} />
        {renderExtra?.(value, setValue)}
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">حفظ</Button>
        </div>
      </form>
    </Modal>
  )
}
