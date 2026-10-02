import { Navigate, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  AlertingCreationFlow,
  canCreateCertificateRenewalAlert,
  getSelectedAlertMetrics,
  isLegacyRdsDatabase,
  useRdsAlertTarget,
} from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { Button, EmptyState, LoaderSpinner } from '@qovery/shared/ui'

interface AlertsCreateSearch {
  templates?: string
}

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
  // Waiting for the RDS instance here keeps the flow from rendering before its identifier is known.
  const rdsAlertTarget = useRdsAlertTarget({ organizationId, service })

  const certificateEnabled = canCreateCertificateRenewalAlert(
    useFeatureFlagEnabled('certificate-renewal-alert'),
    service
  )
  const selectedMetrics = getSelectedAlertMetrics(metric, search.templates, certificateEnabled, rdsAlertTarget.isRds)

  const goToAlertsList = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts',
      params: { organizationId, projectId, environmentId, serviceId },
    })
  }

  if (!isEnvironmentFetched || !isServiceFetched || rdsAlertTarget.isResolving) {
    return (
      <div className="flex min-h-page-container items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  if (rdsAlertTarget.isMetadataUnavailable) {
    return (
      <div className="px-10 py-7">
        <EmptyState
          title="Alert target unavailable"
          description="Unable to load this database's alert target. Try again later."
        >
          <Button size="md" variant="outline" color="neutral" onClick={goToAlertsList}>
            Back to alerts
          </Button>
        </EmptyState>
      </div>
    )
  }

  if (!environment || !service || isLegacyRdsDatabase(service) || selectedMetrics.length === 0) {
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
      onComplete={goToAlertsList}
      onClose={goToAlertsList}
    />
  )
}
