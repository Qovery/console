import { subHours } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  type AlertConfiguration,
  AlertingCreationFlowContext,
  type MetricCategory,
  MetricConfigurationStep,
  QUERY_CPU,
  QUERY_HTTP_ERROR,
  QUERY_HTTP_LATENCY,
  QUERY_INSTANCE_RESTART,
  QUERY_MEMORY,
  QUERY_MISSING_REPLICAS,
  useAlertRules,
  useContainerName,
  useEditAlertRule,
  useEnvironment,
  useIngressName,
} from '@qovery/domains/observability/feature'
import { generateConditionDescription } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { APPLICATION_MONITORING_ALERTS_URL, APPLICATION_MONITORING_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'

export function PageAlertingEditFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '', alertId = '' } = useParams()
  const navigate = useNavigate()
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId })
  const { data: alertRules = [] } = useAlertRules({
    organizationId: organizationId,
    serviceId: applicationId,
  })
  const { mutateAsync: editAlertRule, isLoading: isLoadingEditAlertRule } = useEditAlertRule({ organizationId })

  const hasStorage = service?.serviceType === 'CONTAINER' && (service.storage || []).length > 0

  const now = new Date()
  const oneHourAgo = subHours(now, 1)

  const { data: containerName } = useContainerName({
    clusterId: environment?.cluster_id ?? '',
    serviceId: service?.id ?? '',
    resourceType: hasStorage ? 'statefulset' : 'deployment',
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const { data: ingressName } = useIngressName({
    clusterId: environment?.cluster_id ?? '',
    serviceId: service?.id ?? '',
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([])

  const alertRule = alertRules.find((rule) => rule.id === alertId)

  useEffect(() => {
    if (alertRule && alerts.length === 0) {
      const rawThreshold = alertRule.condition.threshold ?? 0
      const threshold =
        alertRule.tag === 'http_latency'
          ? rawThreshold
          : alertRule.condition.threshold != null
            ? rawThreshold * 100
            : 80

      const alertConfig: AlertConfiguration = {
        id: alertRule.id,
        tag: alertRule.tag ?? 'CPU',
        for_duration: alertRule.for_duration || 'PT5M',
        condition: {
          kind: alertRule.condition.kind || 'BUILT',
          function: alertRule.condition.function || 'AVG',
          operator: alertRule.condition.operator || 'ABOVE',
          threshold,
          promql: alertRule.condition.promql || '',
        },
        name: alertRule.name,
        severity: alertRule.severity,
        alert_receiver_ids: alertRule.alert_receiver_ids || [],
        skipped: false,
        presentation: { summary: alertRule.presentation.summary },
      }
      setAlerts([alertConfig])
    }
  }, [alertRule, alerts.length])

  if (!service || !environment || !alertRule || alerts.length === 0) return null

  const handleComplete = async (updatedAlerts?: AlertConfiguration[]) => {
    const updatedAlert = updatedAlerts ? updatedAlerts[0] : alerts[0]

    const threshold =
      updatedAlert.tag === 'http_latency'
        ? updatedAlert.condition.threshold ?? 0
        : (updatedAlert.condition.threshold ?? 0) / 100
    const operator = updatedAlert.condition.operator ?? 'ABOVE'
    const func = updatedAlert.condition.function ?? 'NONE'

    if (updatedAlert && environment && containerName && ingressName) {
      try {
        await editAlertRule({
          alertRuleId: alertId,
          payload: {
            name: updatedAlert.name,
            tag: updatedAlert.tag,
            description: generateConditionDescription(func, operator, threshold, updatedAlert.tag as MetricCategory),
            condition: {
              kind: 'BUILT',
              function: func,
              operator,
              threshold,
              promql: match(updatedAlert.tag)
                .with('cpu', () => QUERY_CPU(containerName))
                .with('memory', () => QUERY_MEMORY(containerName))
                .with('missing_replicas', () => QUERY_MISSING_REPLICAS(containerName))
                .with('instance_restart', () => QUERY_INSTANCE_RESTART(containerName))
                .with('http_error', () => QUERY_HTTP_ERROR(ingressName))
                .with('http_latency', () => QUERY_HTTP_LATENCY(ingressName))
                .otherwise(() => ''),
            },
            for_duration: updatedAlert.for_duration,
            severity: updatedAlert.severity,
            enabled: true,
            alert_receiver_ids: updatedAlert.alert_receiver_ids,
            presentation: {
              summary: updatedAlert.presentation.summary,
            },
          },
        })
        navigate(
          APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
            APPLICATION_MONITORING_URL +
            APPLICATION_MONITORING_ALERTS_URL
        )
      } catch (error) {
        console.error('Error updating alert:', error)
      }
    }
  }

  const handleExit = () => {
    if (window.confirm('Do you really want to leave? Your changes will be lost.')) {
      navigate(
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
          APPLICATION_MONITORING_URL +
          APPLICATION_MONITORING_ALERTS_URL
      )
    }
  }

  return (
    <AlertingCreationFlowContext.Provider
      value={{
        selectedMetrics: [alertRule.description || 'custom'],
        serviceId: applicationId,
        serviceName: service.name,
        currentStepIndex,
        setCurrentStepIndex,
        alerts,
        setAlerts,
        onComplete: handleComplete,
        isLoading: isLoadingEditAlertRule,
        totalSteps: 1,
        containerName,
        ingressName,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onNavigateToMetric: () => {},
      }}
    >
      <FunnelFlow portal totalSteps={1} currentStep={1} currentTitle="Edit Alert" onExit={handleExit}>
        <MetricConfigurationStep isEdit />
      </FunnelFlow>
    </AlertingCreationFlowContext.Provider>
  )
}

export default PageAlertingEditFeature
