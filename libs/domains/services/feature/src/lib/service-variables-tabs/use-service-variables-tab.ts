import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useCluster } from '@qovery/domains/clusters/feature'
import { isEditableServiceType } from '@qovery/domains/services/data-access'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { useService } from '../hooks/use-service/use-service'

export function useServiceVariablesTab() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: cluster } = useCluster({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    suspense: true,
  })
  const { data: service } = useService({
    environmentId,
    serviceId,
    suspense: true,
  })

  const secretManagers = useMemo(() => cluster?.secret_manager_accesses ?? [], [cluster?.secret_manager_accesses])
  const hasClusterSecretManagerConfigured = secretManagers.length > 0

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
  }
}
