import { useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { isEditableServiceType } from '@qovery/domains/services/data-access'
import { useVariablesSecretManagers } from '@qovery/domains/variables/feature'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useService } from '../hooks/use-service/use-service'

export function useServiceVariablesTab() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')

  const { secretManagers, hasClusterSecretManagerConfigured, clusterId } = useVariablesSecretManagers({
    enabled: secretManagerEnabled,
  })
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
    hasClusterSecretManagerConfigured: secretManagerEnabled && hasClusterSecretManagerConfigured,
    redeployServiceAction,
    clusterId,
  }
}
