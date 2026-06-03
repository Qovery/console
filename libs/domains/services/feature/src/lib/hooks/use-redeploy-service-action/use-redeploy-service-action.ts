import { useParams } from '@tanstack/react-router'
import { type ServiceType, getDeployableServiceType } from '@qovery/domains/services/data-access'
import { useDeployService } from '../use-deploy-service/use-deploy-service'

export function useRedeployServiceAction(serviceType?: ServiceType) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { mutate: deployService } = useDeployService({
    organizationId,
    projectId,
    environmentId,
  })

  return () => {
    const deployableServiceType = getDeployableServiceType(serviceType)

    if (!deployableServiceType) {
      return
    }

    deployService({
      serviceId,
      serviceType: deployableServiceType,
    })
  }
}
