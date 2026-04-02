import { useParams, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ClusterAvatar, useClusters } from '@qovery/domains/clusters/feature'
import { EnvironmentMode, isFakeArgoCdService, useEnvironments } from '@qovery/domains/environments/feature'
import { useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { ServiceAvatar, ServiceStateChip, useServices } from '@qovery/domains/services/feature'
import { Avatar } from '@qovery/shared/ui'
import { Separator } from '../header'
import { BreadcrumbItem, type BreadcrumbItemData } from './breadcrumb-item'

export function Breadcrumbs() {
  const { buildLocation } = useRouter()
  const {
    organizationId = '',
    clusterId = '',
    projectId = '',
    environmentId = '',
    serviceId = '',
  } = useParams({ strict: false })

  const { data: organizations = [] } = useOrganizations({
    enabled: true,
    suspense: true,
  })
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId, suspense: true })
  const { data: clusters = [] } = useClusters({ organizationId, suspense: true })
  const { data: projects = [] } = useProjects({ organizationId, suspense: true })
  const { data: environments = [] } = useEnvironments({ projectId, suspense: true })
  const { data: services = [] } = useServices({ environmentId, suspense: true })

  // Necessary to keep the organization from client by Qovery team
  const allOrganizations =
    organizations.find((org) => org.id !== organizationId) && organization
      ? [...organizations.filter((org) => org.id !== organizationId), organization]
      : organizations

  const orgItems: BreadcrumbItemData[] = allOrganizations
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
    .map((organization) => ({
      id: organization.id,
      label: organization.name,
      path: buildLocation({ to: '/organization/$organizationId/overview', params: { organizationId: organization.id } })
        .href,
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
      to: '/organization/$organizationId/cluster/$clusterId/overview',
      params: { organizationId, clusterId: cluster.id },
    }).href,
  }))

  const projectItems: BreadcrumbItemData[] = projects
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
    .map((project) => ({
      id: project.id,
      label: project.name,
      path: buildLocation({
        to: '/organization/$organizationId/project/$projectId/overview',
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
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: { organizationId, projectId: environment.project.id, environmentId: environment.id },
      }).href,
    }))

  const serviceItems: BreadcrumbItemData[] = services
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
    .map((service) => {
      const serviceEnvironmentId = service.environment?.id ?? environmentId
      const isArgoCdService =
        Boolean(serviceEnvironmentId) &&
        isFakeArgoCdService({
          environmentId: serviceEnvironmentId,
          serviceId: service.id,
        })
      const serviceAvatar = isArgoCdService ? { ...service, icon_uri: 'app://qovery-console/argocd' } : service

      return {
        id: service.id,
        label: service.name,
        path: buildLocation({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
          params: { organizationId, projectId, environmentId, serviceId: service.id },
        }).href,
        prefix: (
          <ServiceAvatar service={service} size="custom" className="h-5 w-5" serviceAvatarRadius="sm" radius="none" />
        ),
        suffix: <ServiceStateChip mode="running" environmentId={service.environment?.id} serviceId={service.id} />,
      }
    })

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

  return (
    <div className="flex items-center gap-2">
      {breadcrumbData.map((data, index) => (
        <div key={data.item.id} className="flex items-center gap-2">
          <BreadcrumbItem item={data.item} items={data.items} isCurrentScope={index === breadcrumbData.length - 1} />
          {index < breadcrumbData.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}

export default Breadcrumbs
