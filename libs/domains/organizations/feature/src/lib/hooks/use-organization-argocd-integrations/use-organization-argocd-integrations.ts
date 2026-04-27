import { useQueries } from '@tanstack/react-query'
import { type ArgoCdCredentialsResponse, type Cluster } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useClusters } from '@qovery/domains/clusters/feature'
import { queries } from '@qovery/state/util-queries'

export interface OrganizationArgoCdIntegration {
  id: string
  clusterId: string
  clusterName: string
  clusterCloudProvider?: Cluster['cloud_provider']
  argoCdUrl: string
  lastCheckedAt?: string | null
  createdAt: string
  updatedAt: string
}

const toOrganizationArgoCdIntegration = (
  cluster: Cluster,
  credentials: ArgoCdCredentialsResponse
): OrganizationArgoCdIntegration => ({
  id: credentials.id,
  clusterId: cluster.id,
  clusterName: cluster.name,
  clusterCloudProvider: cluster.cloud_provider,
  argoCdUrl: credentials.argocd_url,
  lastCheckedAt: credentials.last_checked_at,
  createdAt: credentials.created_at,
  updatedAt: credentials.updated_at,
})

export interface UseOrganizationArgoCdIntegrationsProps {
  organizationId: string
  enabled?: boolean
}

export function useOrganizationArgoCdIntegrations({
  organizationId,
  enabled = true,
}: UseOrganizationArgoCdIntegrationsProps) {
  const { data: clusters = [], isLoading: isClustersLoading } = useClusters({
    organizationId,
    enabled,
  })

  console.log('clusters', clusters)

  const argoCdCredentialsResults = useQueries({
    queries: clusters.map((cluster) => ({
      ...queries.clusters.argoCdCredentials({ clusterId: cluster.id }),
      enabled,
    })),
  })

  const data = useMemo(
    () =>
      clusters
        .flatMap((cluster, index) => {
          const credentials = argoCdCredentialsResults[index]?.data

          return credentials ? [toOrganizationArgoCdIntegration(cluster, credentials)] : []
        })
        .sort((integrationA, integrationB) => integrationA.clusterName.localeCompare(integrationB.clusterName)),
    [
      clusters,
      JSON.stringify(
        argoCdCredentialsResults.map(({ data }) => ({
          id: data?.id,
          updatedAt: data?.updated_at,
        }))
      ),
    ]
  )

  return {
    data,
    isLoading: isClustersLoading || argoCdCredentialsResults.some(({ isLoading }) => isLoading),
  }
}

export default useOrganizationArgoCdIntegrations
