import { useParams } from 'react-router-dom'
import { ServiceAlerting } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageMonitoringAlertsFeature() {
  const { applicationId = '' } = useParams()

  useDocumentTitle('Alerts - Qovery')

  const { data: service } = useService({ serviceId: applicationId })

  if (!service) return null

  return (
    <div className="flex h-full">
      <ServiceAlerting />
    </div>
  )
}

export default PageMonitoringAlertsFeature
