import { useLocation, useParams, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ClusterAvatar, useClusters } from '@qovery/domains/clusters/feature'
import { EnvironmentMode, useEnvironments } from '@qovery/domains/environments/feature'
import { useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { sortProjectsByFavorite, useFavoriteProjects, useProjects } from '@qovery/domains/projects/feature'
import { ServiceAvatar, ServiceStateChip, useServices } from '@qovery/domains/services/feature'
import { Avatar } from '@qovery/shared/ui'
import { Separator } from '../header'
import { type AppSpace } from '../space-switcher/space-switcher'
import { BreadcrumbItem, type BreadcrumbItemData, type BreadcrumbMenuAction } from './breadcrumb-item'

interface BreadcrumbsProps {
  activeSpace?: AppSpace
}

type BreadcrumbData = {
  item: BreadcrumbItemData
  items: BreadcrumbItemData[]
}

function useOrganizationBreadcrumb(activeSpace: AppSpace) {
  const { buildLocation } = useRouter()
  const location = useLocation()
  const { organizationId = '' } = useParams({ strict: false })
  const { data: organizations = [] } = useOrganizations({
    enabled: true,
    suspense: true,
  })
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId, suspense: true })

  // Necessary to keep the organization from client by Qovery team
  const allOrganizations =
    organizations.find((org) => org.id !== organizationId) && organization
      ? [...organizations.filter((org) => org.id !== organizationId), organization]
      : organizations

  const items: BreadcrumbItemData[] = [...allOrganizations]
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
    .map((organization) => ({
      id: organization.id,
      label: organization.name,
      path:
        activeSpace === 'agents'
          ? buildLocation({
              to: '/organization/$organizationId/agents',
              params: { organizationId: organization.id },
            }).href
          : buildLocation({
              to: '/organization/$organizationId/infrastructure/overview',
              params: { organizationId: organization.id },
            }).href,
      logo_url: organization.logo_url ?? undefined,
    }))

  const currentOrganization = items.find((organization) => organization.id === organizationId)
  const data: BreadcrumbData | undefined = currentOrganization
    ? {
        item: {
          ...currentOrganization,
          prefix: (
            <Avatar
              src={currentOrganization.logo_url}
              fallback={currentOrganization.label.charAt(0).toUpperCase()}
              size="sm"
              border="solid"
              className="mr-0.5"
            />
          ),
        },
        items,
      }
    : undefined

  const footerAction: BreadcrumbMenuAction = {
    label: 'Create organization',
    path: '/onboarding/project',
    search: {
      previousUrl: location.href,
    },
  }

  return { data, footerAction }
}

export function Breadcrumbs({ activeSpace = 'infrastructure' }: BreadcrumbsProps) {
  return activeSpace === 'agents' ? <OrganizationBreadcrumbs /> : <InfrastructureBreadcrumbs />
}

function OrganizationBreadcrumbs() {
  const { data, footerAction } = useOrganizationBreadcrumb('agents')

  return <BreadcrumbTrail data={data ? [data] : []} footerAction={footerAction} />
}

function InfrastructureBreadcrumbs() {
  const { buildLocation } = useRouter()
  const {
    organizationId = '',
    clusterId = '',
    projectId = '',
    environmentId = '',
    serviceId = '',
  } = useParams({ strict: false })

  const { data: organizationBreadcrumb, footerAction } = useOrganizationBreadcrumb('infrastructure')
  const { data: clusters = [] } = useClusters({ organizationId, suspense: true })
  const { data: projects = [] } = useProjects({ organizationId, suspense: true })
  const { isProjectFavorite } = useFavoriteProjects({ organizationId })
  const { data: environments = [] } = useEnvironments({ projectId, suspense: true })
  const { data: services = [] } = useServices({ environmentId, suspense: true })

  const clusterItems: BreadcrumbItemData[] = clusters.map((cluster) => ({
    id: cluster.id,
    label: cluster.name,
    path: buildLocation({
      to: '/organization/$organizationId/infrastructure/cluster/$clusterId/overview',
      params: { organizationId, clusterId: cluster.id },
    }).href,
  }))

  const projectItems: BreadcrumbItemData[] = sortProjectsByFavorite(projects, isProjectFavorite).map((project) => ({
    id: project.id,
    label: project.name,
    path: buildLocation({
      to: '/organization/$organizationId/infrastructure/project/$projectId/overview',
      params: { organizationId, projectId: project.id },
    }).href,
  }))

  const environmentItems: BreadcrumbItemData[] = environments
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
    .map((environment) => ({
      id: environment.id,
      label: environment.name,
      prefix: <EnvironmentMode mode={environment.mode} variant="shrink" />,
      path: buildLocation({
        to: '/organization/$organizationId/infrastructure/project/$projectId/environment/$environmentId/overview',
        params: { organizationId, projectId: environment.project.id, environmentId: environment.id },
      }).href,
    }))

  const serviceItems: BreadcrumbItemData[] = services
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
    .map((service) => ({
      id: service.id,
      label: service.name,
      path: buildLocation({
        to: '/organization/$organizationId/infrastructure/project/$projectId/environment/$environmentId/service/$serviceId/overview',
        params: { organizationId, projectId, environmentId, serviceId: service.id },
      }).href,
      prefix: (
        <ServiceAvatar service={service} size="custom" className="h-5 w-5" serviceAvatarRadius="sm" radius="none" />
      ),
      suffix: <ServiceStateChip mode="running" environmentId={service.environment?.id} serviceId={service.id} />,
    }))

  const currentCluster = useMemo(
    () => clusterItems.find((cluster) => cluster.id === clusterId),
    [clusterId, clusterItems]
  )

  const currentProject = useMemo(
    () => projectItems.find((project) => project.id === projectId),
    [projectId, projectItems]
  )

  const currentEnvironment = useMemo(
    () => environmentItems.find((environment) => environment.id === environmentId),
    [environmentId, environmentItems]
  )

  const currentService = useMemo(
    () => serviceItems.find((service) => service.id === serviceId),
    [serviceId, serviceItems]
  )

  const breadcrumbData: BreadcrumbData[] = organizationBreadcrumb ? [organizationBreadcrumb] : []

  if (currentCluster) {
    breadcrumbData.push({
      item: {
        id: 'clusters',
        label: 'Clusters',
        path: buildLocation({
          to: '/organization/$organizationId/infrastructure/clusters',
          params: { organizationId },
        }).href,
      },
      items: [],
    })
    breadcrumbData.push({
      item: {
        ...currentCluster,
        prefix: <ClusterAvatar cluster={clusters.find((cluster) => cluster.id === clusterId)} size="sm" />,
      },
      items: clusterItems,
    })
  }

  if (currentProject) {
    breadcrumbData.push({
      item: currentProject,
      items: projectItems,
    })
  }

  if (currentEnvironment) {
    breadcrumbData.push({
      item: currentEnvironment,
      items: environmentItems,
    })
  }

  if (currentService) {
    breadcrumbData.push({
      item: currentService,
      items: serviceItems,
    })
  }

  return <BreadcrumbTrail data={breadcrumbData} footerAction={footerAction} />
}

interface BreadcrumbTrailProps {
  data: BreadcrumbData[]
  footerAction: BreadcrumbMenuAction
}

function BreadcrumbTrail({ data, footerAction }: BreadcrumbTrailProps) {
  return (
    <div className="no-scrollbar flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
      {data.map((breadcrumb, index) => (
        <div
          key={breadcrumb.item.id}
          className={
            index === data.length - 1 ? 'flex min-w-0 flex-1 items-center gap-2' : 'flex shrink-0 items-center gap-2'
          }
        >
          <BreadcrumbItem
            item={breadcrumb.item}
            items={breadcrumb.items}
            isCurrentScope={index === data.length - 1}
            footerAction={index === 0 ? footerAction : undefined}
          />
          {index < data.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}

export default Breadcrumbs
