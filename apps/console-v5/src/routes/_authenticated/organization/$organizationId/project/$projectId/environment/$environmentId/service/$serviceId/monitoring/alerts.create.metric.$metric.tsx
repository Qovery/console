import { Navigate, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { AlertingCreationFlow, type MetricCategory } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

interface AlertsCreateSearch {
  templates?: string
}

const METRIC_CATEGORIES: MetricCategory[] = [
  'cpu',
  'memory',
  'http_error',
  'http_latency',
  'missing_instance',
  'instance_restart',
  'hpa_limit',
]

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/create/metric/$metric'
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): AlertsCreateSearch => ({
    templates: typeof search.templates === 'string' ? search.templates : undefined,
  }),
})

function RouteComponent() {
  const {
    organizationId = '',
    projectId = '',
    environmentId = '',
    serviceId = '',
    metric = '',
  } = useParams({ strict: false })
  const search = Route.useSearch()
  const navigate = useNavigate()

  const { data: environment, isFetched: isEnvironmentFetched } = useEnvironment({ environmentId })
  const { data: service, isFetched: isServiceFetched } = useService({ environmentId, serviceId })

  const selectedMetrics = useMemo(() => {
    const fromTemplates = (search.templates ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter((item): item is MetricCategory => METRIC_CATEGORIES.includes(item as MetricCategory))

    if (fromTemplates.length > 0) {
      return fromTemplates
    }

    if (METRIC_CATEGORIES.includes(metric as MetricCategory)) {
      return [metric as MetricCategory]
    }

    return ['cpu' as MetricCategory]
  }, [metric, search.templates])

  if (!isEnvironmentFetched || !isServiceFetched) {
    return (
      <div className="flex min-h-page-container items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  if (!environment || !service || selectedMetrics.length === 0) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts"
        params={{ organizationId, projectId, environmentId, serviceId }}
        replace
      />
    )
  }

  return (
    <AlertingCreationFlow
      organizationId={organizationId}
      environment={environment}
      service={service}
      selectedMetrics={selectedMetrics}
      onComplete={() => {
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts',
          params: { organizationId, projectId, environmentId, serviceId },
        })
      }}
      onClose={() => {
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts',
          params: { organizationId, projectId, environmentId, serviceId },
        })
      }}
    />
  )
}
