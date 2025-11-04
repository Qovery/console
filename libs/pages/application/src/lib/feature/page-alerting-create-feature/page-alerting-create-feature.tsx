import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertingCreationFlow } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { APPLICATION_MONITORING_ALERTS_URL, APPLICATION_MONITORING_URL, APPLICATION_URL } from '@qovery/shared/routes'

export function PageAlertingCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const navigate = useNavigate()
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { state } = useLocation()
  if (!service) return null

  console.log(state)

  return (
    <AlertingCreationFlow
      service={service}
      selectedMetrics={state?.metricCategories ?? []}
      onComplete={(alerts) => {
        console.log(alerts)
      }}
      onClose={() => {
        navigate(
          APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
            APPLICATION_MONITORING_URL +
            APPLICATION_MONITORING_ALERTS_URL
        )
      }}
    />
  )
}

export default PageAlertingCreateFeature
