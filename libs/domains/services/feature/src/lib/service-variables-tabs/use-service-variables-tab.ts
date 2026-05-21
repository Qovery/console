import { useParams } from '@tanstack/react-router'
import { isEditableServiceType } from '@qovery/domains/services/data-access'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useService } from '../hooks/use-service/use-service'
import { useVariablesSecretManagers } from './use-variables-secret-managers'

export function useServiceVariablesTab() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { secretManagers, hasClusterSecretManagerConfigured, clusterId } = useVariablesSecretManagers()
  const { data: service } = useService({
    environmentId,
    serviceId,
    suspense: true,
  })

  const { mutate: deployService } = useDeployService({
    organizationId,
    projectId,
    environmentId,
  })

  const redeployServiceAction = () => {
    if (!service?.serviceType || !isEditableServiceType(service.serviceType)) {
      return
    }

    deployService({
      serviceId,
      serviceType: service.serviceType,
    })
  }

  return {
    secretManagers,
    hasClusterSecretManagerConfigured,
    redeployServiceAction,
    clusterId,
  }
}
