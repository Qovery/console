import { useParams, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ClusterAvatar, useClusters } from '@qovery/domains/clusters/feature'
import { useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { Avatar } from '@qovery/shared/ui'
import { Separator } from '../header'
import { BreadcrumbItem, type BreadcrumbItemData } from './breadcrumb-item'

export function Breadcrumbs() {
  const { buildLocation } = useRouter()
  const { organizationId, clusterId } = useParams({ strict: false })

  const { data: organizations = [] } = useOrganizations({
    enabled: true,
  })
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { data: clusters = [] } = useClusters({ organizationId })

  // Necessary to keep the organization from client by Qovery team
  const allOrganizations =
    organizations.find((org) => org.id !== organizationId) && organization
      ? [...organizations, organization]
      : organizations

  const orgItems: BreadcrumbItemData[] = allOrganizations.map((organization) => ({
    id: organization.id,
    label: organization.name,
    path: buildLocation({ to: '/organization/$organizationId', params: { organizationId: organization.id } }).href,
    logo_url: organization.logo_url ?? undefined,
  }))

  const currentOrg = useMemo(
    () => orgItems.find((organization) => organization.id === organizationId),
    [organizationId, orgItems]
  )

  const clusterItems: BreadcrumbItemData[] = clusters.map((cluster) => ({
    id: cluster.id,
    label: cluster.name,
    path: buildLocation({
      to: '/organization/$organizationId/cluster/$clusterId',
      params: { organizationId, clusterId: cluster.id },
    }).href,
  }))

  const currentCluster = useMemo(
    () => clusterItems.find((cluster) => cluster.id === clusterId),
    [clusterId, clusterItems]
  )

  const breadcrumbData: Array<{ item: BreadcrumbItemData; items: BreadcrumbItemData[] }> = []

  if (currentOrg) {
    breadcrumbData.push({
      item: {
        ...currentOrg,
        prefix: (
          <Avatar
            src={currentOrg.logo_url}
            fallback={currentOrg.label.charAt(0).toUpperCase()}
            size="sm"
            border="solid"
            className="mr-0.5"
          />
        ),
      },
      items: orgItems,
    })
  }

  if (currentCluster) {
    breadcrumbData.push({
      item: {
        ...currentCluster,
        prefix: <ClusterAvatar cluster={clusters.find((cluster) => cluster.id === clusterId)} size="sm" />,
      },
      items: clusterItems,
    })
  }

  return (
    <div className="flex items-center gap-2">
      {breadcrumbData.map((data, index) => (
        <div key={data.item.id} className="flex items-center gap-2">
          <BreadcrumbItem item={data.item} items={data.items} />
          {index < breadcrumbData.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}

export default Breadcrumbs
