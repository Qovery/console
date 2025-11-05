import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { APPLICATION_URL } from '@qovery/shared/routes'
import { APPLICATION_MONITORING_ALERTS_CREATION_URL } from '@qovery/shared/routes'
import { APPLICATION_MONITORING_URL } from '@qovery/shared/routes'
import { ErrorBoundary, FunnelFlow } from '@qovery/shared/ui'
import { type AlertConfiguration } from './bulk-creation-flow.types'
import { ALERTING_CREATION_METRIC, ROUTER_ALERTING_CREATION, type RouteType } from './router'

const METRIC_LABELS: Record<string, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  instances: 'Instances',
  k8s_event: 'k8s event',
  network: 'Network',
  logs: 'Logs',
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
  service: AnyService
  selectedMetrics: string[]
  onClose: () => void
  onComplete: (alerts: AlertConfiguration[]) => void
}

export function AlertingCreationFlow({ selectedMetrics, service, onClose, onComplete }: AlertingCreationFlowProps) {
  const { organizationId = '', projectId = '' } = useParams()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([])

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

  // const pathAlerts =
  //   APPLICATION_URL(organizationId, projectId, service.environment.id, service.id) +
  //   APPLICATION_MONITORING_URL +
  //   APPLICATION_MONITORING_ALERTS_CREATION_URL

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
      }}
    >
      <FunnelFlow
        portal
        totalSteps={totalSteps}
        currentStep={currentStepIndex + 1}
        currentTitle={getCurrentTitle()}
        onExit={handleExit}
      >
        <div className="w-full bg-white">
          <Routes>
            {ROUTER_ALERTING_CREATION.map((route: RouteType) => (
              <Route
                key={route.path}
                path={route.path}
                element={<ErrorBoundary key={route.path}>{route.component}</ErrorBoundary>}
              />
            ))}
            <Route path="*" element={<Navigate replace to={`metric/${selectedMetrics[0]}`} />} />
          </Routes>
        </div>
      </FunnelFlow>
    </AlertingCreationFlowContext.Provider>
  )
}

export default AlertingCreationFlow
