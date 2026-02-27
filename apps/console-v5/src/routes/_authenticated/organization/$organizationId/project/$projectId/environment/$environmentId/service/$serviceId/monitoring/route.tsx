import { Outlet } from '@tanstack/react-router'
import { createFileRoute, useParams, useRouterState } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ErrorBoundary, LoaderSpinner, Sidebar } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring'
)({
  component: RouteComponent,
})

const OutletLoader = () => (
  <div className="flex min-h-page-container items-center justify-center">
    <LoaderSpinner />
  </div>
)

function RouteComponent() {
  const { organizationId = '', projectId, environmentId, serviceId } = useParams({ strict: false })
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const pathMonitoring = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/${serviceId}/monitoring`
  const isAlertCreationFlow = pathname.includes('/monitoring/alerts/create/')
  const isAlertEditFlow = /\/monitoring\/alerts\/[^/]+\/edit$/.test(pathname)
  const isAlertSubRoute = isAlertCreationFlow || isAlertEditFlow

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: cluster } = useCluster({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    suspense: true,
  })
  const hasAlerting = cluster?.metrics_parameters?.configuration?.alerting?.enabled ?? false

  const dashboardLink = {
    title: 'Dashboard',
    to: `${pathMonitoring}/dashboard`,
    icon: 'table-cells-large' as const,
  }

  const alertsLink = {
    title: 'Alerts',
    to: `${pathMonitoring}/alerts`,
    icon: 'light-emergency' as const,
  }

  const LINKS_MONITORING = hasAlerting ? [dashboardLink, alertsLink] : [dashboardLink]

  return (
    <div className="flex min-h-0 flex-1">
      {!isAlertSubRoute && (
        <aside className="relative min-h-[calc(100vh-2.75rem-4rem)] w-52 shrink-0 self-stretch border-r border-neutral">
          <div className="sticky top-16">
            <Sidebar.Root className="mt-6">
              {LINKS_MONITORING.map((link) => (
                <Sidebar.Item key={link.to} to={link.to} icon={link.icon}>
                  {link.title}
                </Sidebar.Item>
              ))}
            </Sidebar.Root>
          </div>
        </aside>
      )}
      <div className="min-w-0 flex-1">
        <div className="container mx-auto px-0">
          <ErrorBoundary>
            <Suspense fallback={<OutletLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
