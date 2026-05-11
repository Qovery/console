import { Outlet, createFileRoute, useParams } from '@tanstack/react-router'
import { useAlerts } from '@qovery/domains/observability/feature'
import { ErrorBoundary, Sidebar } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/alerts')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Alerting')

  const { data: alerts = [] } = useAlerts({ organizationId })
  const issuesCount = alerts.length
  const pathAlerts = `/organization/${organizationId}/alerts`

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
        <div className="sticky top-16">
          <Sidebar.Root className="mt-6">
            <Sidebar.Item
              to={`${pathAlerts}/issues`}
              icon={issuesCount > 0 ? 'light-emergency-on' : 'light-emergency'}
              iconStyle="regular"
              badge={issuesCount > 0 ? String(issuesCount) : undefined}
            >
              Issues
            </Sidebar.Item>
            <Sidebar.Item to={`${pathAlerts}/alert-rules`} icon="list-check" iconStyle="solid">
              Alert rules
            </Sidebar.Item>
            <Sidebar.Item to={`${pathAlerts}/notification-channel`} icon="bullhorn" iconStyle="regular">
              Notification channel
            </Sidebar.Item>
          </Sidebar.Root>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="container mx-auto h-full px-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
