import FormRenderer from '@/components/form-runtime/FormRenderer'
import { FormModel } from '@/components/types'
export const dynamic = 'force-dynamic'

async function fetchForm(id: string): Promise<FormModel> {
  const api = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const res = await fetch(`${api}/api/forms/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`fetch form failed: ${res.status} ${res.statusText}`)
  return res.json()
}

export default async function FormPage({ params }: { params: { id: string } }) {
  const form = await fetchForm(params.id)
  return (
    <div className="space-y-6">
      <FormRenderer form={form} />
    </div>
  )
}
