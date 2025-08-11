import LiveAnalytics from '@/components/analytics/LiveAnalytics'
export const dynamic = 'force-dynamic'

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <LiveAnalytics formId={params.id} />
    </div>
  )
}
