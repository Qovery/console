import { useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { Heading, Icon, InputSearch, Link, LoaderSpinner, Section, TreeView } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'

export interface AssociatedItem {
  project_id?: string | null
  project_name?: string | null
  environment_id?: string | null
  environment_name?: string | null
  item_id: string
  item_name: string
  item_type: string
  item_link_id?: string | null
  item_subtitle?: string | null
  cluster_id?: string | null
  cluster_name?: string | null
}

interface Service {
  service_id: string
  service_name: string
  service_type: string
  service_link_id?: string | null
  service_subtitle?: string | null
}

interface Environment {
  environment_id: string
  environment_name: string
  services: Service[]
}

interface Project {
  project_id: string
  project_name: string
  environments: Environment[]
}

export function groupByProjectEnvironmentsServices(data: AssociatedItem[], searchValue?: string) {
  const projects: Project[] = []

  data.forEach((item) => {
    const projectId = item.project_id ?? ''
    const projectName = item.project_name ?? ''
    const environmentId = item.environment_id ?? ''
    const environmentName = item.environment_name ?? ''
    const itemName = item.item_name ?? ''

    if (
      searchValue === undefined ||
      projectName.toLowerCase().includes(searchValue.toLowerCase()) ||
      environmentName.toLowerCase().includes(searchValue.toLowerCase()) ||
      itemName.toLowerCase().includes(searchValue.toLowerCase())
    ) {
      let project = projects.find((proj) => proj.project_id === projectId)
      if (!project) {
        project = {
          project_id: projectId,
          project_name: projectName,
          environments: [],
        }
        projects.push(project)
      }

      let environment = project.environments.find((env) => env.environment_id === environmentId)
      if (!environment) {
        environment = {
          environment_id: environmentId,
          environment_name: environmentName,
          services: [],
        }
        project.environments.push(environment)
      }

      environment.services.push({
        service_id: item.item_id,
        service_name: itemName,
        service_type: item.item_type,
        service_link_id: item.item_link_id,
        service_subtitle: item.item_subtitle,
      })
    }
  })

  return projects
}

function isClusterAssociatedItem(item: AssociatedItem): boolean {
  return item.item_type === 'CLUSTER'
}

export function getServiceAssociatedItems(data: AssociatedItem[]): AssociatedItem[] {
  return data.filter((item) => !isClusterAssociatedItem(item))
}

export function filterClustersForAssociatedItemsModal(data: AssociatedItem[], searchValue?: string): AssociatedItem[] {
  return data.filter((item) => {
    if (!isClusterAssociatedItem(item)) {
      return false
    }
    if (searchValue === undefined || searchValue === '') {
      return true
    }
    const search = searchValue.toLowerCase()
    return (
      (item.item_name?.toLowerCase().includes(search) ?? false) ||
      (item.cluster_name?.toLowerCase().includes(search) ?? false)
    )
  })
}

export interface AssociatedItemsModalProps {
  title: string
  organizationId: string
  items: AssociatedItem[]
  isLoading: boolean
  onClose: () => void
  searchPlaceholder?: string
  itemLabel?: string
}

export function AssociatedItemsModal({
  title,
  organizationId,
  items,
  isLoading,
  onClose,
  searchPlaceholder = 'Search by project, environment, service, or cluster name',
  itemLabel = 'Service',
}: AssociatedItemsModalProps) {
  const [searchValue, setSearchValue] = useState<string | undefined>()
  const normalizedSearch = searchValue?.trim() || undefined

  const serviceSourceItems = useMemo(() => getServiceAssociatedItems(items), [items])
  const clusterSourceItems = useMemo(() => filterClustersForAssociatedItemsModal(items), [items])

  const serviceTreeData = useMemo(
    () => groupByProjectEnvironmentsServices(serviceSourceItems, normalizedSearch),
    [serviceSourceItems, normalizedSearch]
  )
  const clusterRows = useMemo(
    () => filterClustersForAssociatedItemsModal(items, normalizedSearch),
    [items, normalizedSearch]
  )

  const hasServicesInSource = serviceSourceItems.length > 0
  const hasClustersInSource = clusterSourceItems.length > 0
  const hasAnySource = hasServicesInSource || hasClustersInSource
  const noSearchResults =
    Boolean(normalizedSearch) && hasAnySource && serviceTreeData.length === 0 && clusterRows.length === 0

  return (
    <Section className="p-6">
      <Heading className="mb-6 text-2xl text-neutral">{title}</Heading>
      {isLoading ? (
        <div className="flex h-40 items-start justify-center p-5">
          <LoaderSpinner className="w-5" />
        </div>
      ) : (
        <>
          <InputSearch
            className="mb-3"
            placeholder={searchPlaceholder}
            onChange={(value) => setSearchValue(value)}
          />
          {noSearchResults ? (
            <div className="px-5 py-4 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-subtle" />
              <p className="mt-1 text-xs font-medium text-neutral-subtle">No value found</p>
            </div>
          ) : !hasAnySource ? (
            <div className="px-5 py-4 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-subtle" />
              <p className="mt-1 text-xs font-medium text-neutral-subtle">No value found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {hasClustersInSource ? (
                <div>
                  <Heading level={3} className="mb-2 text-neutral">
                    {pluralize(clusterSourceItems.length, 'Cluster')}
                  </Heading>
                  {clusterRows.length > 0 ? (
                    <ul className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-2">
                      {clusterRows.map((cluster) => {
                        const clusterId = cluster.cluster_id ?? cluster.item_id
                        const displayName = cluster.cluster_name ?? cluster.item_name
                        return (
                          <li key={cluster.item_id}>
                            <Link
                              color="brand"
                              onClick={() => onClose()}
                              to="/organization/$organizationId/cluster/$clusterId/overview"
                              params={{ organizationId, clusterId }}
                              className="flex items-center py-2 text-sm"
                            >
                              <Icon name={IconEnum.KUBERNETES} width={20} className="mr-2" />
                              {displayName}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="mb-2 text-xs text-neutral-subtle">No matching clusters.</p>
                  )}
                </div>
              ) : null}
              {hasServicesInSource ? (
                <div>
                  <Heading level={3} className="mb-2 text-neutral">
                    {pluralize(serviceSourceItems.length, itemLabel)}
                  </Heading>
                  {serviceTreeData.length > 0 ? (
                    <TreeView.Root
                      type="single"
                      collapsible
                      className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-2"
                    >
                      {serviceTreeData.map((project) => (
                        <TreeView.Item key={project.project_id} value={project.project_name}>
                          <TreeView.Trigger>{project.project_name}</TreeView.Trigger>
                          <TreeView.Content>
                            {project.environments.map((environment) => (
                              <TreeView.Root key={environment.environment_id} type="single" collapsible>
                                <TreeView.Item value={environment.environment_name}>
                                  <TreeView.Trigger>
                                    <Link
                                      color="brand"
                                      onClick={() => onClose()}
                                      to="/organization/$organizationId/project/$projectId/environment/$environmentId"
                                      params={{
                                        organizationId,
                                        environmentId: environment.environment_id,
                                        projectId: project.project_id,
                                      }}
                                      className="text-sm"
                                    >
                                      {environment.environment_name}
                                    </Link>
                                  </TreeView.Trigger>
                                  <TreeView.Content>
                                    <ul>
                                      {environment.services.map((service) => (
                                        <li key={service.service_id} className=" border-l border-neutral">
                                          <Link
                                            color="brand"
                                            onClick={() => onClose()}
                                            to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId"
                                            params={{
                                              organizationId,
                                              environmentId: environment.environment_id,
                                              serviceId: service.service_link_id ?? service.service_id,
                                              projectId: project.project_id,
                                            }}
                                            className="flex items-center py-1.5 pl-5 text-sm"
                                          >
                                            <Icon
                                              name={match(service.service_type)
                                                .with('CRON', 'LIFECYCLE', () => `${service.service_type}_JOB`)
                                                .otherwise(() => service.service_type)}
                                              width={20}
                                              className="mr-2"
                                            />
                                            <span className="flex min-w-0 flex-col">
                                              <span className="truncate">{service.service_name}</span>
                                              {service.service_subtitle && (
                                                <span className="truncate text-xs text-neutral-subtle">
                                                  {service.service_subtitle}
                                                </span>
                                              )}
                                            </span>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </TreeView.Content>
                                </TreeView.Item>
                              </TreeView.Root>
                            ))}
                          </TreeView.Content>
                        </TreeView.Item>
                      ))}
                    </TreeView.Root>
                  ) : (
                    <p className="text-xs text-neutral-subtle">
                      No matching {pluralize(serviceSourceItems.length, itemLabel.toLowerCase())}.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </Section>
  )
}

export default AssociatedItemsModal
