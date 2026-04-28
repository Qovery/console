import { type Cluster } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useClusters } from '@qovery/domains/clusters/feature'

export type OrganizationArgoCdClusterType = 'Qovery managed' | 'Self managed'

export interface OrganizationArgoCdLinkedCluster {
  id: string
  destinationCluster: string
  clusterId: string
  clusterName: string
  cloudProvider?: Cluster['cloud_provider']
  clusterType: OrganizationArgoCdClusterType
  argocdName?: string | null
  applicationsCount: number
}

export interface OrganizationArgoCdUnlinkedCluster {
  id: string
  destinationCluster: string
  clusterId: null
  clusterName?: string | null
  cloudProvider?: Cluster['cloud_provider'] | null
  clusterType?: OrganizationArgoCdClusterType | null
  argocdName?: string | null
  applicationsCount: number
}

export interface OrganizationArgoCdIntegration {
  id: string
  agentClusterId: string
  agentClusterName: string
  agentClusterCloudProvider?: Cluster['cloud_provider']
  argoCdUrl: string
  status: 'connected'
  lastCheckedAt: string
  linkedClusters: OrganizationArgoCdLinkedCluster[]
  unlinkedClusters: OrganizationArgoCdUnlinkedCluster[]
}

export interface UseOrganizationArgoCdIntegrationsProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

const APPLICATIONS_COUNT_BY_INDEX = [4, 13, 42] as const
const UNLINKED_CLUSTERS = [
  {
    destinationCluster: 'https://unmapped.example.com',
    argocdName: 'external-prod',
    applicationsCount: 7,
  },
  {
    destinationCluster: 'https://another.example.com',
    argocdName: 'external-staging',
    applicationsCount: 2,
  },
] as const

const getClusterType = (cluster: Cluster): OrganizationArgoCdClusterType =>
  cluster.kubernetes === 'SELF_MANAGED' ? 'Self managed' : 'Qovery managed'

export function useOrganizationArgoCdIntegrations({
  organizationId,
  enabled = true,
  suspense = false,
}: UseOrganizationArgoCdIntegrationsProps) {
  const { data: clusters = [], isLoading } = useClusters({
    organizationId,
    enabled,
    suspense,
  })

  const data = useMemo<OrganizationArgoCdIntegration[]>(() => {
    const [agentCluster] = clusters

    if (!agentCluster) {
      return []
    }

    const linkedClusters = clusters.slice(0, 3).map((cluster, index) => ({
      id: `linked-${cluster.id}`,
      destinationCluster:
        index === 0
          ? 'https://kubernetes.default.svc'
          : `https://${cluster.name.toLowerCase().replace(/\s+/g, '-')}.example.com`,
      clusterId: cluster.id,
      clusterName: cluster.name,
      cloudProvider: cluster.cloud_provider,
      clusterType: getClusterType(cluster),
      argocdName: index === 0 ? 'kube-system' : index === 1 ? null : 'argocd',
      applicationsCount: APPLICATIONS_COUNT_BY_INDEX[index] ?? APPLICATIONS_COUNT_BY_INDEX.at(-1) ?? 1,
    }))

    const unlinkedClusters = UNLINKED_CLUSTERS.map((cluster, index) => ({
      id: `unlinked-${index + 1}`,
      destinationCluster: cluster.destinationCluster,
      clusterId: null,
      clusterName: null,
      cloudProvider: null,
      clusterType: null,
      argocdName: cluster.argocdName,
      applicationsCount: cluster.applicationsCount,
    }))

    return [
      {
        id: `integration-${agentCluster.id}`,
        agentClusterId: agentCluster.id,
        agentClusterName: agentCluster.name,
        agentClusterCloudProvider: agentCluster.cloud_provider,
        argoCdUrl: 'https://argocd.example.com',
        status: 'connected',
        lastCheckedAt: '2026-04-28T12:20:00.000Z',
        linkedClusters,
        unlinkedClusters,
      },
    ]
  }, [clusters])

  return {
    data,
    isLoading,
  }
}

export default useOrganizationArgoCdIntegrations
