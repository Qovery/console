import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '../hooks/use-environment/use-environment'

export function useVariablesSecretManagers() {
  const { organizationId = '', environmentId = '' } = useParams({ strict: false })

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: cluster } = useCluster({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    suspense: true,
  })

  const secretManagers = useMemo(() => cluster?.secret_manager_accesses ?? [], [cluster?.secret_manager_accesses])

  return {
    secretManagers,
    hasClusterSecretManagerConfigured: secretManagers.length > 0,
    clusterId: environment?.cluster_id ?? '',
  }
}
