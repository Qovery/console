import { subHours } from 'date-fns'
import { type AlertTargetType, type Environment } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ErrorBoundary, FunnelFlow } from '@qovery/shared/ui'
import { useContainerName } from '../../hooks/use-container-name/use-container-name'
import { useCreateAlertRule } from '../../hooks/use-create-alert-rule/use-create-alert-rule'
import { useIngressName } from '../../hooks/use-ingress-name/use-ingress-name'
import { type AlertConfiguration, type MetricCategory } from './alerting-creation-flow.types'
import { MetricConfigurationStep } from './metric-configuration-step/metric-configuration-step'
import {
  QUERY_CPU,
  QUERY_HPA_ISSUE,
  QUERY_HTTP_ERROR,
  QUERY_HTTP_LATENCY,
  QUERY_MEMORY,
  QUERY_REPLICAS_NUMBER,
  QUERY_RESTART_REASON,
} from './summary-step/alert-queries'

const METRIC_LABELS: Record<MetricCategory, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  hpa_issue: 'HPA issue',
  http_error: 'HTTP error',
  http_latency: 'HTTP latency',
  restart_reason: 'Replicas number',
  missing_replicas: 'Missing replicas',
}

interface AlertingCreationFlowContextInterface {
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
  onNavigateToMetric: (index: number) => void
  onComplete: (alerts: AlertConfiguration[]) => Promise<void>
  isLoading: boolean
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
  environment: Environment
  service: AnyService
  selectedMetrics: MetricCategory[]
  onClose: () => void
  onComplete: (alerts: AlertConfiguration[]) => void
}

export function AlertingCreationFlow({
  selectedMetrics,
  environment,
  service,
  onClose,
  onComplete,
}: AlertingCreationFlowProps) {
  const { organizationId = '' } = useParams()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { mutateAsync: createAlertRule } = useCreateAlertRule({ organizationId })

  const handleNavigateToMetric = (index: number) => {
    setCurrentStepIndex(index)
  }

  const hasStorage = service?.serviceType === 'CONTAINER' && (service.storage || []).length > 0

  const now = new Date()
  const oneHourAgo = subHours(now, 1)

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

  const serviceId = service.id
  const serviceName = service.name

  const totalSteps = selectedMetrics.length

  const getCurrentTitle = () => {
    const metricCategory = selectedMetrics[currentStepIndex]
    if (!metricCategory) {
      return 'Alerts'
    }
    const metricLabel = METRIC_LABELS[metricCategory] || metricCategory
    return `${metricLabel} alert`
  }

  const handleExit = () => {
    if (window.confirm('Do you really want to leave? Your progress will be lost.')) {
      onClose()
    }
  }

  const handleComplete = async (alertsToCreate: AlertConfiguration[]) => {
    if (!containerName || !ingressName) return

    const activeAlerts = alertsToCreate.filter((alert) => !alert.skipped)

    try {
      setIsLoading(true)
      for (const alert of activeAlerts) {
        const threshold = (alert.condition.threshold ?? 0) / 100
        const operator = alert.condition.operator ?? 'ABOVE'
        const func = alert.condition.function ?? 'NONE'

        await createAlertRule({
          payload: {
            organization_id: organizationId,
            cluster_id: environment.cluster_id,
            target: {
              target_id: service.id,
              target_type: service.serviceType as AlertTargetType,
            },
            name: alert.name,
            tag: alert.tag,
            description: alert.tag,
            condition: {
              kind: 'BUILT',
              function: func,
              operator,
              threshold,
              promql: match(alert.tag)
                .with('cpu', () => QUERY_CPU(containerName))
                .with('memory', () => QUERY_MEMORY(containerName))
                .with('replicas_number', () => QUERY_REPLICAS_NUMBER(containerName))
                .with('hpa_issue', () => QUERY_HPA_ISSUE(service.id))
                .with('restart_reason', () => QUERY_RESTART_REASON(containerName))
                .with('http_error', () => QUERY_HTTP_ERROR(ingressName))
                .with('http_latency', () => QUERY_HTTP_LATENCY(ingressName))
                .otherwise(() => ''),
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
        onNavigateToMetric: handleNavigateToMetric,
        onComplete: handleComplete,
        isLoading,
      }}
    >
      <FunnelFlow
        portal
        totalSteps={totalSteps}
        currentStep={currentStepIndex + 1}
        currentTitle={getCurrentTitle()}
        onExit={handleExit}
      >
        <ErrorBoundary>
          <MetricConfigurationStep />
        </ErrorBoundary>
      </FunnelFlow>
    </AlertingCreationFlowContext.Provider>
  )
}

export default AlertingCreationFlow
