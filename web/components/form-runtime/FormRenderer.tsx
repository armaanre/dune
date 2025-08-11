"use client"

import { Field, FormModel } from '../types'
import { Button, Input, Select, Textarea } from '../ui'
import { useMemo, useState } from 'react'

export default function FormRenderer({ form }: { form: FormModel }) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const canSubmit = useMemo(() => {
    return form.fields.every(f => {
      if (!f.required) return true
      const v = answers[f.id]
      if (f.type === 'text') return typeof v === 'string' && v.trim().length > 0
      if (f.type === 'multiple_choice') return typeof v === 'string' && v
      if (f.type === 'checkbox') return Array.isArray(v) && v.length > 0
      if (f.type === 'rating') return typeof v === 'number' && !Number.isNaN(v)
      return true
    })
  }, [answers, form.fields])

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/api/forms/${form.id}/responses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert('Submit failed: ' + JSON.stringify(json))
        return
      }
      setAnswers({})
      alert('Thanks for your response!')
    } finally {
      setSubmitting(false)
    }
  }

  function renderField(f: Field) {
    if (f.type === 'text') {
      return (
        <Textarea value={answers[f.id] ?? ''} onChange={e => setAnswers(a => ({ ...a, [f.id]: e.target.value }))} placeholder={f.placeholder} />
      )
    }
    if (f.type === 'multiple_choice') {
      return (
        <Select value={answers[f.id] ?? ''} onChange={e => setAnswers(a => ({ ...a, [f.id]: e.target.value }))}>
          <option value="">Select...</option>
          {(f.options ?? []).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </Select>
      )
    }
    if (f.type === 'checkbox') {
      const arr: string[] = answers[f.id] ?? []
      return (
        <div className="space-y-2">
          {(f.options ?? []).map(o => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={arr.includes(o.id)} onChange={e => {
                setAnswers(a => {
                  const cur: string[] = Array.isArray(a[f.id]) ? a[f.id] : []
                  const next = e.target.checked ? [...cur, o.id] : cur.filter(x => x !== o.id)
                  return { ...a, [f.id]: next }
                })
              }} />
              {o.label}
            </label>
          ))}
        </div>
      )
    }
    if (f.type === 'rating') {
      const min = f.minRating ?? 1
      const max = f.maxRating ?? 5
      return (
        <div className="flex items-center gap-2">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(n => (
            <button key={n} className={(answers[f.id] ?? 0) === n ? 'rounded bg-black px-2 py-1 text-white' : 'rounded border px-2 py-1'} onClick={() => setAnswers(a => ({ ...a, [f.id]: n }))}>{n}</button>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{form.title}</h2>
      <div className="space-y-4">
        {form.fields.map(f => (
          <div key={f.id} className="space-y-2">
            <div className="text-sm font-medium">
              {f.label}
              {f.required && <span className="text-red-600">*</span>}
            </div>
            {renderField(f)}
          </div>
        ))}
      </div>
      <Button disabled={!canSubmit || submitting} onClick={submit} className="bg-black text-white">Submit</Button>
    </div>
  )
}
