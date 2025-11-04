import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Icon } from '@qovery/shared/ui'
import { useAlertingCreationFlowContext } from '../alerting-creation-flow'

export function SummaryStep() {
  const navigate = useNavigate()
  const { serviceName, setCurrentStepIndex, alerts, onComplete, selectedMetrics } = useAlertingCreationFlowContext()

  useEffect(() => {
    setCurrentStepIndex(selectedMetrics.length)
  }, [selectedMetrics.length, setCurrentStepIndex])

  const handleEdit = (index: number) => {
    navigate(`../metric/${index}`)
  }

  const handleConfirm = () => {
    const activeAlerts = alerts.filter((alert) => !alert.skipped)
    onComplete(activeAlerts)
  }

  const activeAlerts = alerts.filter((alert) => !alert.skipped)
  const skippedCount = alerts.length - activeAlerts.length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto bg-white px-10 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-medium text-neutral-400">Review your alerts</h1>
          <p className="text-sm text-neutral-350">
            Review the {activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''} you've configured for{' '}
            <span className="font-medium text-neutral-400">{serviceName}</span>
            {skippedCount > 0 && <span className="text-neutral-350"> ({skippedCount} skipped)</span>}
          </p>
        </div>

        <div className="space-y-4">
          {alerts.map((alert, index) => {
            if (alert.skipped) return null

            return (
              <div
                key={index}
                className="flex items-start justify-between rounded-lg border border-neutral-250 bg-white p-5 transition-colors hover:border-neutral-300"
              >
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-medium text-neutral-400">{alert.name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                      }`}
                    >
                      {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-sm text-neutral-350">
                    <p>
                      <span className="font-medium uppercase text-neutral-400">{alert.metricCategory}</span>{' '}
                      <span className="uppercase">{alert.metricType}</span> is{' '}
                      <span className="font-medium">{alert.condition.operator}</span>{' '}
                      <span className="font-medium text-brand-500">{alert.condition.threshold}%</span> during the last{' '}
                      <span className="font-medium">{alert.condition.duration}</span>
                    </p>
                    <p className="text-xs">
                      Auto-resolve: {alert.autoResolve.operator} {alert.autoResolve.threshold}% for{' '}
                      {alert.autoResolve.duration}
                    </p>
                  </div>

                  {alert.notificationChannels.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Icon iconName="bell" iconStyle="regular" className="text-xs text-neutral-350" />
                      <span className="text-xs text-neutral-350">
                        {alert.notificationChannels.length} notification channel
                        {alert.notificationChannels.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  color="neutral"
                  size="sm"
                  onClick={() => handleEdit(index)}
                  className="ml-4 gap-1.5"
                >
                  <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                  Edit
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-neutral-250 bg-white px-10 py-4">
        <Button size="lg" onClick={handleConfirm}>
          Create {activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}

export default SummaryStep
