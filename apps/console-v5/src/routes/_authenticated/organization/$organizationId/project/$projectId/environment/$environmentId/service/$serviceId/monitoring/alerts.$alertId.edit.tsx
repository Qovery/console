import { Navigate, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { AlertRuleConditionOperator } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  type AlertConfiguration,
  AlertingCreationFlow,
  type MetricCategory,
  useAlertRules,
} from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/$alertId/edit'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    organizationId = '',
    projectId = '',
    environmentId = '',
    serviceId = '',
    alertId = '',
  } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: environment, isFetched: isEnvironmentFetched } = useEnvironment({ environmentId })
  const { data: service, isFetched: isServiceFetched } = useService({ environmentId, serviceId })
  const { data: alertRules = [], isFetched: isAlertRulesFetched } = useAlertRules({
    organizationId,
    serviceId,
  })
  const alertRule = useMemo(() => alertRules.find((rule) => rule.id === alertId), [alertId, alertRules])

  const goToAlertsList = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts',
      params: { organizationId, projectId, environmentId, serviceId },
    })
  }

  const initialAlert = useMemo<AlertConfiguration[] | undefined>(() => {
    if (!alertRule) {
      return undefined
    }

    const rawThreshold = alertRule.condition.threshold ?? 0
    const threshold =
      alertRule.tag === 'http_latency' ? rawThreshold : alertRule.condition.threshold != null ? rawThreshold * 100 : 80
    const isMissingInstance = alertRule.tag === 'missing_instance'

    return [
      {
        id: alertRule.id,
        tag: alertRule.tag,
        for_duration: alertRule.for_duration || 'PT5M',
        condition: {
          kind: alertRule.condition.kind || 'BUILT',
          function: alertRule.condition.function || 'AVG',
          operator: isMissingInstance ? AlertRuleConditionOperator.BELOW : alertRule.condition.operator || 'ABOVE',
          threshold: isMissingInstance ? 1 : threshold,
          promql: alertRule.condition.promql || '',
        },
        name: alertRule.name,
        severity: alertRule.severity,
        alert_receiver_ids: alertRule.alert_receiver_ids || [],
        skipped: false,
        presentation: { summary: alertRule.presentation.summary },
      },
    ]
  }, [alertRule])

  if (!isEnvironmentFetched || !isServiceFetched || !isAlertRulesFetched) {
    return (
      <div className="flex min-h-page-container items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  if (!environment || !service || !alertRule || !initialAlert) {
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
      selectedMetrics={[alertRule.tag as MetricCategory]}
      mode="edit"
      initialAlerts={initialAlert}
      alertRuleId={alertId}
      onComplete={() => goToAlertsList()}
      onClose={() => goToAlertsList()}
    />
  )
}
