import { subHours } from 'date-fns'
import { type Environment } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ErrorBoundary, FunnelFlow } from '@qovery/shared/ui'
import { useContainerName } from '../../hooks/use-container-name/use-container-name'
import { useIngressName } from '../../hooks/use-ingress-name/use-ingress-name'
import { type AlertConfiguration } from './alerting-creation-flow.types'
import { ROUTER_ALERTING_CREATION, type RouteType } from './router'

const METRIC_LABELS: Record<string, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  k8s_event: 'k8s event',
  hpa_issue: 'HPA issue',
  qovery_http_error: 'HTTP error',
  replicas_number: 'Replicas number',
}

interface AlertingCreationFlowContextInterface {
  selectedMetrics: string[]
  serviceId: string
  serviceName: string
  currentStepIndex: number
  setCurrentStepIndex: (index: number) => void
  alerts: AlertConfiguration[]
  setAlerts: (alerts: AlertConfiguration[]) => void
  onComplete: (alerts: AlertConfiguration[]) => void
  totalSteps: number
  containerName?: string
  ingressName?: string
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
  selectedMetrics: string[]
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
  const [searchParams] = useSearchParams()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([])

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

  const totalSteps = selectedMetrics.length + 1

  const getCurrentTitle = () => {
    const metricCategory = selectedMetrics[currentStepIndex]
    if (!metricCategory) {
      return 'Alerts'
    }
    return `${METRIC_LABELS[metricCategory] || metricCategory} alerts`
  }

  const handleExit = () => {
    if (window.confirm('Do you really want to leave? Your progress will be lost.')) {
      onClose()
    }
  }

  const preserveQueryString = searchParams.toString() ? `?${searchParams.toString()}` : ''

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
        onComplete,
        totalSteps,
        containerName,
        ingressName,
      }}
    >
      <FunnelFlow
        portal
        totalSteps={totalSteps}
        currentStep={currentStepIndex + 1}
        currentTitle={getCurrentTitle()}
        onExit={handleExit}
      >
        <Routes>
          {ROUTER_ALERTING_CREATION.map((route: RouteType) => (
            <Route
              key={route.path}
              path={route.path}
              element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
            />
          ))}
          <Route path="*" element={<Navigate replace to={`metric/${selectedMetrics[0]}${preserveQueryString}`} />} />
        </Routes>
      </FunnelFlow>
    </AlertingCreationFlowContext.Provider>
  )
}

export default AlertingCreationFlow
