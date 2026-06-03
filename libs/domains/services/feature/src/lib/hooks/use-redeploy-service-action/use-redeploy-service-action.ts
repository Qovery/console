import { useParams } from '@tanstack/react-router'
import { type ServiceType, isEditableServiceType } from '@qovery/domains/services/data-access'
import { useDeployService } from '../use-deploy-service/use-deploy-service'

export function useRedeployServiceAction(serviceType?: ServiceType) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { mutate: deployService } = useDeployService({
    organizationId,
    projectId,
    environmentId,
  })

  return () => {
    if (!isEditableServiceType(serviceType)) {
      return
    }

    deployService({
      serviceId,
      serviceType,
    })
  }
}
