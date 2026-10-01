import { subHours } from 'date-fns'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type AlertTargetType, type Environment } from 'qovery-typescript-axios'
import { createContext, useContext, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ErrorBoundary, FunnelFlow } from '@qovery/shared/ui'
import { useContainerName } from '../../hooks/use-container-name/use-container-name'
import { useCreateAlertRule } from '../../hooks/use-create-alert-rule/use-create-alert-rule'
import { useEditAlertRule } from '../../hooks/use-edit-alert-rule/use-edit-alert-rule'
import { useHpaName } from '../../hooks/use-hpa-name/use-hpa-name'
import { useHttpRouteName } from '../../hooks/use-http-route-name/use-http-route-name'
import { useIngressName } from '../../hooks/use-ingress-name/use-ingress-name'
import { generateConditionDescription } from '../../util-alerting/generate-condition-description'
import { useRdsAlertTarget } from '../use-rds-alert-target/use-rds-alert-target'
import { type AlertConfiguration, type MetricCategory } from './alerting-creation-flow.types'
import { CONTAINER_METRICS, HTTP_METRICS, canCreateCertificateRenewalAlert } from './metric-availability'
import { MetricConfigurationStep } from './metric-configuration-step/metric-configuration-step'
import {
  RDS_METRICS,
  getRdsAlertQuery,
  isRdsMetricCategory,
  mapRdsMetrics,
  toRdsMetricThreshold,
} from './rds-alert-metrics'
import {
  QUERY_CERTIFICATE_RENEWAL_FAILED,
  QUERY_CPU,
  QUERY_HPA_ISSUE,
  QUERY_HTTP_ERROR_COMBINED,
  QUERY_HTTP_LATENCY_COMBINED,
  QUERY_INSTANCE_RESTART,
  QUERY_MEMORY,
  QUERY_MISSING_INSTANCE,
} from './summary-step/alert-queries'

const METRIC_LABELS: Record<MetricCategory, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  http_error: 'HTTP error',
  http_latency: 'HTTP latency',
  instance_restart: 'Instance restart',
  missing_instance: 'Missing instance',
  hpa_limit: 'Auto-scaling limit',
  certificate_renewal_failed: 'Certificate renewal failed',
  ...mapRdsMetrics((category) => RDS_METRICS[category].label),
}

interface AlertingCreationFlowContextInterface {
  organizationId: string
  selectedMetrics: string[]
  serviceId: string
  serviceName: string
  currentStepIndex: number
  setCurrentStepIndex: (index: number) => void
  alerts: AlertConfiguration[]
  setAlerts: (alerts: AlertConfiguration[]) => void
  totalSteps: number
  containerName?: string
  ingressName?: string
  httpRouteName?: string
  onNavigateToMetric: (index: number) => void
  onComplete: (alerts: AlertConfiguration[]) => Promise<void>
  isLoading: boolean
  submissionUnavailableReason?: string
}

export const AlertingCreationFlowContext = createContext<AlertingCreationFlowContextInterface | undefined>(undefined)

export const useAlertingCreationFlowContext = () => {
  const context = useContext(AlertingCreationFlowContext)
  if (!context) {
    throw new Error('useAlertingCreationFlowContext must be used within an AlertingCreationFlowContext')
  }
  return context
}

interface AlertingCreationFlowProps {
  organizationId: string
  environment: Environment
  service: AnyService
  selectedMetrics: MetricCategory[]
  mode?: 'create' | 'edit'
  initialAlerts?: AlertConfiguration[]
  alertRuleId?: string
  onClose: () => void
  onComplete: (alerts: AlertConfiguration[]) => void
}

export function AlertingCreationFlow({
  organizationId,
  selectedMetrics,
  environment,
  service,
  mode = 'create',
  initialAlerts,
  alertRuleId,
  onClose,
  onComplete,
}: AlertingCreationFlowProps) {
  const certificateEnabled = canCreateCertificateRenewalAlert(
    useFeatureFlagEnabled('certificate-renewal-alert'),
    service
  )
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [alerts, setAlerts] = useState<AlertConfiguration[]>(initialAlerts ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = mode === 'edit'
  // Edit mode keeps the saved query and target, so it does not need any RDS metadata.
  const rdsAlertTarget = useRdsAlertTarget({ organizationId, service, enabled: !isEditMode })

  const { mutateAsync: createAlertRule } = useCreateAlertRule({ organizationId })
  const { mutateAsync: editAlertRule } = useEditAlertRule({ organizationId })

  const handleNavigateToMetric = (index: number) => {
    setCurrentStepIndex(index)
  }

  const hasStorage =
    (service?.serviceType === 'CONTAINER' || service?.serviceType === 'APPLICATION') &&
    'storage' in service &&
    (service.storage || []).length > 0

  const { now, oneHourAgo } = useMemo(() => {
    const now = new Date()
    const oneHourAgo = subHours(now, 1)
    return { now, oneHourAgo }
  }, [])

  const { data: containerName } = useContainerName({
    clusterId: environment.cluster_id,
    serviceId: service.id,
    resourceType: hasStorage ? 'statefulset' : 'deployment',
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const { data: ingressName } = useIngressName({
    clusterId: environment.cluster_id,
    serviceId: service.id,
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const { data: httpRouteName } = useHttpRouteName({
    clusterId: environment.cluster_id,
    serviceId: service.id,
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const hasAutoscaling =
    (service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
    service?.min_running_instances !== service?.max_running_instances

  const { data: hpaName } = useHpaName({
    clusterId: environment.cluster_id,
    serviceId: service.id,
    enabled: hasAutoscaling,
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const serviceId = service.id
  const serviceName = service.name

  const totalSteps = isEditMode ? 1 : selectedMetrics.length
  const hasRdsMetric = selectedMetrics.some(isRdsMetricCategory)
  const submissionUnavailableReason = !hasRdsMetric
    ? undefined
    : match({ isEditMode, ...rdsAlertTarget })
        .with({ isEditMode: true }, () =>
          initialAlerts?.some((alert) => isRdsMetricCategory(alert.tag) && !alert.condition.promql)
            ? 'The saved RDS query is missing. This alert cannot be edited here.'
            : undefined
        )
        .with({ isMetadataUnavailable: true }, () => "Unable to load this database's alert target. Try again later.")
        .when(
          ({ isRds, target }) => !isRds || !target,
          () => 'The RDS alert target is unavailable. Try again later.'
        )
        .with({ hasCloudWatchMetrics: false }, () => 'Enable CloudWatch metrics on this cluster to create RDS alerts.')
        .when(
          ({ dbInstance }) => !dbInstance,
          () => 'Deploy this database to make its RDS instance identifier available before creating alerts.'
        )
        .otherwise(() => undefined)

  const getCurrentTitle = () => {
    if (isEditMode) {
      return 'Edit Alert'
    }
    const metricCategory = selectedMetrics[currentStepIndex]
    if (!metricCategory) {
      return 'Alerts'
    }
    const metricLabel = METRIC_LABELS[metricCategory] || metricCategory
    return `${metricLabel} alert`
  }

  const handleExit = () => {
    const message = isEditMode
      ? 'Do you really want to leave? Your changes will be lost.'
      : 'Do you really want to leave? Your progress will be lost.'
    if (window.confirm(message)) {
      onClose()
    }
  }

  const handleComplete = async (alertsToCreate: AlertConfiguration[]) => {
    const activeAlerts = alertsToCreate.filter((alert) => !alert.skipped)

    const hasContainerMetric = activeAlerts.some((alert) => CONTAINER_METRICS.includes(alert.tag as MetricCategory))
    const hasHttpMetric = activeAlerts.some((alert) => HTTP_METRICS.includes(alert.tag as MetricCategory))
    const hasHpaMetric = activeAlerts.some((alert) => alert.tag === 'hpa_limit')
    const hasActiveRdsMetric = activeAlerts.some((alert) => isRdsMetricCategory(alert.tag))

    if (hasContainerMetric && !containerName) return
    if (hasHttpMetric && !(ingressName || httpRouteName)) return
    if (
      hasHpaMetric &&
      !hpaName &&
      (!isEditMode || activeAlerts.some((alert) => alert.tag === 'hpa_limit' && !alert.condition.promql))
    )
      return
    if (!isEditMode && !certificateEnabled && activeAlerts.some((alert) => alert.tag === 'certificate_renewal_failed'))
      return
    if (hasActiveRdsMetric && submissionUnavailableReason) return

    try {
      setIsLoading(true)
      for (const alert of activeAlerts) {
        const isMissingInstance = alert.tag === 'missing_instance'
        const isRdsMetric = isRdsMetricCategory(alert.tag)
        // The threshold input hands its value back as a string.
        const formThreshold = Number(alert.condition.threshold ?? 0)
        const threshold = match(alert.tag)
          .when(isRdsMetricCategory, (category) => toRdsMetricThreshold(category, formThreshold))
          .with('http_latency', () => formThreshold)
          .with('instance_restart', () => 1)
          .with('missing_instance', () => 1)
          .with('hpa_limit', () => 1)
          .with('certificate_renewal_failed', () => 0)
          .otherwise(() => formThreshold / 100)

        const unit = match(alert.tag)
          .when(isRdsMetricCategory, (category) => RDS_METRICS[category].descriptionUnit)
          .with('http_latency', () => 'secs')
          .with('certificate_renewal_failed', () => '')
          .otherwise(() => '%')

        const operator = isMissingInstance && isEditMode ? 'BELOW' : alert.condition.operator ?? 'ABOVE'
        const func = isRdsMetric ? 'NONE' : alert.condition.function ?? 'NONE'
        const description = match(alert.tag)
          .with('instance_restart', () => 'One or more instances restarted unexpectedly')
          .with('missing_instance', () => 'Missing one or more running instances for this service')
          .with('hpa_limit', () => 'Auto-scaling reached the maximum number of instances')
          .with('certificate_renewal_failed', () => 'TLS certificate renewal failed or is overdue for this service')
          .otherwise(() =>
            generateConditionDescription(
              func,
              operator,
              isRdsMetric ? formThreshold : threshold,
              unit,
              alert.for_duration,
              isRdsMetric ? (alert.tag as MetricCategory) : undefined
            )
          )

        const promql = match(alert.tag)
          .when(isRdsMetricCategory, (category) =>
            isEditMode
              ? alert.condition.promql ?? ''
              : getRdsAlertQuery(category, rdsAlertTarget.dbInstance ?? '') ?? ''
          )
          .with('cpu', () => (containerName ? QUERY_CPU(containerName) : ''))
          .with('memory', () => (containerName ? QUERY_MEMORY(containerName) : ''))
          .with('missing_instance', () => (containerName ? QUERY_MISSING_INSTANCE(containerName) : ''))
          .with('instance_restart', () => (containerName ? QUERY_INSTANCE_RESTART(containerName) : ''))
          .with('http_error', () => QUERY_HTTP_ERROR_COMBINED(ingressName || '', httpRouteName || ''))
          .with('http_latency', () => QUERY_HTTP_LATENCY_COMBINED(ingressName || '', httpRouteName || ''))
          .with('hpa_limit', () => (hpaName ? QUERY_HPA_ISSUE(hpaName) : alert.condition.promql || ''))
          .with('certificate_renewal_failed', () => QUERY_CERTIFICATE_RENEWAL_FAILED(service.id))
          .otherwise(() => '')

        const target = isRdsMetric
          ? rdsAlertTarget.target
          : { target_id: service.id, target_type: service.serviceType as AlertTargetType }

        if (isEditMode) {
          if (!alertRuleId) {
            throw new Error('alertRuleId is required in edit mode')
          }

          await editAlertRule({
            alertRuleId,
            payload: {
              name: alert.name,
              tag: alert.tag,
              description,
              condition: {
                kind: 'BUILT',
                function: func,
                operator,
                threshold,
                promql,
              },
              for_duration: alert.for_duration,
              severity: alert.severity,
              enabled: true,
              alert_receiver_ids: alert.alert_receiver_ids,
              presentation: {
                summary: alert.presentation.summary,
              },
            },
          })
        } else {
          if (!target) throw new Error('RDS alert target is unavailable')
          await createAlertRule({
            payload: {
              organization_id: organizationId,
              cluster_id: environment.cluster_id,
              target,
              name: alert.name,
              tag: alert.tag,
              description,
              condition: {
                kind: 'BUILT',
                function: func,
                operator,
                threshold,
                promql,
              },
              for_duration: alert.for_duration,
              severity: alert.severity,
              enabled: true,
              alert_receiver_ids: alert.alert_receiver_ids,
              presentation: {
                summary: alert.presentation.summary ?? undefined,
              },
            },
          })
        }
      }
      onComplete(activeAlerts)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertingCreationFlowContext.Provider
      value={{
        organizationId,
        selectedMetrics,
        serviceId,
        serviceName,
        currentStepIndex,
        setCurrentStepIndex,
        alerts,
        setAlerts,
        totalSteps,
        containerName,
        ingressName,
        httpRouteName,
        onNavigateToMetric: handleNavigateToMetric,
        onComplete: handleComplete,
        isLoading,
        submissionUnavailableReason,
      }}
    >
      <FunnelFlow
        portal
        totalSteps={totalSteps}
        currentStep={isEditMode ? 1 : currentStepIndex + 1}
        currentTitle={getCurrentTitle()}
        onExit={handleExit}
      >
        <ErrorBoundary>
          <MetricConfigurationStep isEdit={isEditMode} />
        </ErrorBoundary>
      </FunnelFlow>
    </AlertingCreationFlowContext.Provider>
  )
}

export default AlertingCreationFlow
