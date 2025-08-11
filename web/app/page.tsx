import Link from 'next/link'
import AnalyticsLinksButton from '@/components/AnalyticsLinksButton'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-medium">Get started</h2>
        <p className="text-sm text-gray-600">Create a new form, open existing ones, or view analytics.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/builder" className="rounded bg-black px-4 py-2 text-white">New Form</Link>
          <Link href="/forms" className="rounded border px-4 py-2">All Forms</Link>
          <AnalyticsLinksButton />
        </div>
      </div>
    </div>
  )
}
