import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  type AlertConfiguration,
  AlertingCreationFlowContext,
  MetricConfigurationStep,
  useAlertRules,
  useEditAlertRule,
  useEnvironment,
} from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { APPLICATION_MONITORING_ALERTS_URL, APPLICATION_MONITORING_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'

function convertDurationToISO8601(duration: string): string {
  const match = duration.match(/^(\d+)m$/)
  if (match) {
    return `PT${match[1]}M`
  }
  return duration
}

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

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([])

  const alertRule = alertRules.find((rule) => rule.id === alertId)

  useEffect(() => {
    if (alertRule && alerts.length === 0) {
      const alertConfig: AlertConfiguration = {
        id: alertRule.id,
        metricCategory: alertRule.description || 'custom',
        metricType: 'avg',
        condition: {
          operator: 'above',
          threshold: '80',
          duration: alertRule.for_duration || 'PT5M',
        },
        autoResolve: {
          operator: 'below',
          threshold: '80',
          duration: 'PT5M',
        },
        name: alertRule.name,
        severity: alertRule.severity,
        notificationChannels: alertRule.alert_receiver_ids || [],
        skipped: false,
      }
      setAlerts([alertConfig])
    }
  }, [alertRule, alerts.length])

  if (!service || !environment || !alertRule || alerts.length === 0) return null

  const handleComplete = async (updatedAlerts?: AlertConfiguration[]) => {
    const updatedAlert = updatedAlerts ? updatedAlerts[0] : alerts[0]
    if (updatedAlert && environment) {
      try {
        await editAlertRule({
          alertRuleId: alertId,
          payload: {
            name: updatedAlert.name,
            description: updatedAlert.metricCategory,
            promql_expr: `${updatedAlert.condition.operator}(${updatedAlert.condition.threshold})`,
            for_duration: convertDurationToISO8601(updatedAlert.condition.duration),
            severity: updatedAlert.severity,
            enabled: true,
            alert_receiver_ids: updatedAlert.notificationChannels,
            presentation: {},
          },
        })
      } catch (error) {
        console.error('Error updating alert:', error)
      }
    }

    navigate(
      APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
        APPLICATION_MONITORING_URL +
        APPLICATION_MONITORING_ALERTS_URL
    )
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
        totalSteps: 1,
      }}
    >
      <FunnelFlow portal totalSteps={1} currentStep={1} currentTitle="Edit Alert" onExit={handleExit}>
        <MetricConfigurationStep isEdit isLoadingEditAlertRule={isLoadingEditAlertRule} />
      </FunnelFlow>
    </AlertingCreationFlowContext.Provider>
  )
}

export default PageAlertingEditFeature
