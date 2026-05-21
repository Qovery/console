import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queries } from '@qovery/state/util-queries'

export function useVariablesSecretManagers() {
  const { organizationId = '', environmentId = '' } = useParams({ strict: false })

  const { data: environment } = useQuery({
    ...queries.environments.details({ environmentId }),
    enabled: Boolean(environmentId),
    suspense: true,
  })

  const { data: clusters } = useQuery({
    ...queries.clusters.list({ organizationId }),
    enabled: Boolean(organizationId),
    suspense: true,
  })

  const cluster = useMemo(
    () => clusters?.find(({ id }) => id === environment?.cluster_id),
    [clusters, environment?.cluster_id]
  )

  const secretManagers = useMemo(() => cluster?.secret_manager_accesses ?? [], [cluster?.secret_manager_accesses])

  return {
    secretManagers,
    hasClusterSecretManagerConfigured: secretManagers.length > 0,
    clusterId: environment?.cluster_id ?? '',
  }
}
