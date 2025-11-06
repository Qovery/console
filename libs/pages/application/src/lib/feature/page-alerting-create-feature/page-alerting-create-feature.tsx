import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertingCreationFlow } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { APPLICATION_MONITORING_ALERTS_URL, APPLICATION_MONITORING_URL, APPLICATION_URL } from '@qovery/shared/routes'

export function PageAlertingCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  const selectedMetrics = useMemo(() => {
    const templatesParam = searchParams.get('templates')

    if (templatesParam) {
      return templatesParam.split(',').filter(Boolean)
    }

    return ['new']
  }, [searchParams])

  if (!service || selectedMetrics.length === 0) return null

  return (
    <AlertingCreationFlow
      service={service}
      selectedMetrics={selectedMetrics}
      onComplete={() => {
        navigate(
          APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
            APPLICATION_MONITORING_URL +
            APPLICATION_MONITORING_ALERTS_URL
        )
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
