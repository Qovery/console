import { useNavigate, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useDeleteService, useService } from '@qovery/domains/services/feature'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const navigate = useNavigate()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { mutateAsync: deleteService } = useDeleteService({ organizationId, environmentId })

  const mutationDeleteService = async () => {
    if (!service) return

    try {
      await deleteService({ serviceId: applicationId, serviceType: service.serviceType })
      navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <PageSettingsDangerZone
      deleteService={mutationDeleteService}
      serviceName={service?.name}
      environmentMode={environment?.mode}
    />
  )
}

export default PageSettingsDangerZoneFeature
