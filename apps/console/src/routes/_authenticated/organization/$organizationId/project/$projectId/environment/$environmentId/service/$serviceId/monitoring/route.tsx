import { Outlet } from '@tanstack/react-router'
import { createFileRoute, useMatchRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useCluster, useClusterRunningStatusSocket } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  isBlueprintService,
  isManagedDatabase,
  isServiceMYSQL,
  isServicePostgreSQL,
  isTerraform,
} from '@qovery/domains/services/data-access'
import { getRdsBlueprintEngine, useBlueprint, useServiceSummary } from '@qovery/domains/services/feature'
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
  const matchRoute = useMatchRoute()
  const pathMonitoring = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/${serviceId}/monitoring`
  const isAlertCreationFlow = Boolean(
    matchRoute({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/create/metric/$metric',
    })
  )
  const isAlertEditFlow = Boolean(
    matchRoute({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/$alertId/edit',
    })
  )
  const isAlertSubRoute = isAlertCreationFlow || isAlertEditFlow

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: cluster } = useCluster({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    suspense: true,
  })
  const { data: service } = useServiceSummary({ environmentId, serviceId, enabled: true, suspense: true })
  const blueprintId = service && isBlueprintService(service) && isTerraform(service) ? service.blueprint_id : ''
  const { data: blueprint } = useBlueprint({
    blueprintId,
    enabled: Boolean(blueprintId) && cluster?.cloud_provider === 'AWS',
  })
  // Treat unresolved AWS Terraform blueprints as potential RDS services until their metadata arrives.
  const requiresCloudWatchExporter =
    cluster?.cloud_provider === 'AWS' &&
    ((isManagedDatabase(service) && (isServicePostgreSQL(service) || isServiceMYSQL(service))) ||
      (Boolean(blueprintId) && (blueprint === undefined || getRdsBlueprintEngine(service, blueprint) !== undefined)))
  const hasAlerting =
    cluster?.metrics_parameters?.enabled === true &&
    cluster?.metrics_parameters?.configuration?.alerting?.enabled === true &&
    (!requiresCloudWatchExporter ||
      cluster?.metrics_parameters?.configuration?.cloud_watch_export_config?.enabled === true)

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

  useClusterRunningStatusSocket({
    organizationId: environment?.organization.id ?? '',
    clusterId: environment?.cluster_id ?? '',
  })

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
