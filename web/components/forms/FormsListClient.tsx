"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FormModel } from '@/components/types'
import { Button } from '@/components/ui'

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

export default function FormsListClient() {
  const [forms, setForms] = useState<FormModel[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const api = apiBase()
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${api}/api/forms?limit=100`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const data = (await res.json()) as FormModel[]
        if (!cancelled) setForms(data)
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load forms')
          setForms([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className="text-sm text-gray-600">Loading…</div>
  if (error) return (
    <div className="rounded border p-6 text-center">
      <div className="text-base font-medium">Unable to load forms</div>
      <div className="mt-2 text-sm text-gray-600">{error}</div>
      <div className="mt-4"><Link href="/builder" className="rounded bg-black px-4 py-2 text-white">Create a Form</Link></div>
    </div>
  )
  if (!forms || forms.length === 0) return (
    <div className="rounded border p-6 text-center">
      <div className="text-base font-medium">No forms created yet</div>
      <div className="mt-2 text-sm text-gray-600">Get started by creating your first form.</div>
      <div className="mt-4"><Link href="/builder" className="rounded bg-black px-4 py-2 text-white">Create a Form</Link></div>
    </div>
  )

  return (
    <ul className="divide-y rounded border">
      {forms.map(f => (
        <li key={f.id} className="p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{f.title}</div>
            <div className="text-xs text-gray-600">{f.id}</div>
          </div>
          <div className="flex gap-2">
            <Link href={`/forms/${f.id}`} className="text-sm underline">Open</Link>
            <Link href={`/forms/${f.id}/analytics`} className="text-sm underline">Analytics</Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
