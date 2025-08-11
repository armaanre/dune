"use client"

import { useState } from 'react'
import { Button } from './ui'
import { FormModel } from './types'

function apiBase(): string {
  if (typeof window !== 'undefined') {
    const env = process.env.NEXT_PUBLIC_API_URL as string | undefined
    if (env && env.length > 0) return env
    try {
      const u = new URL(window.location.href)
      return `${u.protocol}//${u.hostname}:8080`
    } catch {
      return 'http://localhost:8080'
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
}

export default function AnalyticsLinksButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forms, setForms] = useState<FormModel[] | null>(null)
  const [open, setOpen] = useState(false)

  async function loadForms() {
    setOpen(o => !o)
    if (open) return
    setLoading(true)
    setError(null)
    try {
      const api = apiBase()
      const res = await fetch(`${api}/api/forms?limit=100`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = (await res.json()) as FormModel[]
      setForms(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-block">
      <Button onClick={loadForms}>View Analytics Links</Button>
      {open && (
        <div className="mt-3 w-[28rem] max-w-[90vw] rounded border bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Forms</div>
            <button className="text-sm underline" onClick={() => setOpen(false)}>Close</button>
          </div>
          {loading && <div className="text-sm text-gray-600 mt-2">Loading…</div>}
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          {forms && forms.length === 0 && <div className="text-sm text-gray-600 mt-2">No forms yet. Create one in the builder.</div>}
          {forms && forms.length > 0 && (
            <ul className="mt-2 max-h-64 overflow-auto divide-y">
              {forms.map(f => (
                <li key={f.id} className="py-2">
                  <a href={`/forms/${f.id}/analytics`} className="text-sm underline">
                    {f.title || f.id}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
