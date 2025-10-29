import { useState } from 'react'
import { FunnelFlow } from '@qovery/shared/ui'
import { type AlertConfiguration, type BulkCreationFlowProps } from './bulk-creation-flow.types'
import MetricConfigurationStep from './metric-configuration-step'
import SummaryStep from './summary-step'

const METRIC_LABELS: Record<string, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  instances: 'Instances',
  k8s_event: 'k8s event',
  network: 'Network',
  logs: 'Logs',
}

export function BulkCreationFlow({
  selectedMetrics,
  serviceId,
  serviceName,
  onClose,
  onComplete,
}: BulkCreationFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([])

  const totalSteps = selectedMetrics.length + 1
  const isLastMetric = currentStepIndex === selectedMetrics.length - 1
  const isSummary = currentStepIndex === selectedMetrics.length

  const handleNext = (data: AlertConfiguration) => {
    const newAlerts = [...alerts]
    newAlerts[currentStepIndex] = { ...data, skipped: false }
    setAlerts(newAlerts)

    if (isLastMetric) {
      setCurrentStepIndex(selectedMetrics.length)
    } else {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handleSkip = () => {
    const newAlerts = [...alerts]
    newAlerts[currentStepIndex] = {
      metricCategory: selectedMetrics[currentStepIndex],
      metricType: '',
      condition: { operator: '', threshold: '', duration: '' },
      autoResolve: { operator: '', threshold: '', duration: '' },
      name: '',
      severity: '',
      notificationChannels: [],
      skipped: true,
    }
    setAlerts(newAlerts)

    if (isLastMetric) {
      setCurrentStepIndex(selectedMetrics.length)
    } else {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handleEdit = (index: number) => {
    setCurrentStepIndex(index)
  }

  const handleConfirm = () => {
    const activeAlerts = alerts.filter((alert) => !alert.skipped)
    onComplete(activeAlerts)
  }

  const getCurrentTitle = () => {
    if (isSummary) {
      return 'Summary'
    }
    const metricCategory = selectedMetrics[currentStepIndex]
    return `${METRIC_LABELS[metricCategory] || metricCategory} alerts`
  }

  const renderCurrentStep = () => {
    if (isSummary) {
      return <SummaryStep alerts={alerts} serviceName={serviceName} onConfirm={handleConfirm} onEdit={handleEdit} />
    }

    const metric = selectedMetrics[currentStepIndex]
    return (
      <MetricConfigurationStep
        metricCategory={metric}
        serviceName={serviceName}
        initialData={alerts[currentStepIndex]}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    )
  }

  return (
    <FunnelFlow
      portal
      totalSteps={totalSteps}
      currentStep={currentStepIndex + 1}
      currentTitle={getCurrentTitle()}
      onExit={onClose}
    >
      {renderCurrentStep()}
    </FunnelFlow>
  )
}

export default BulkCreationFlow
