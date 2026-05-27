import { type APIVariableScopeEnum, type ExternalSecretAssociatedServiceResponse } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { Heading, Icon, InputSearch, Link, LoaderSpinner, Section, TreeView } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { useSecretManagerAssociatedServices } from '../hooks/use-secret-manager-associated-services/use-secret-manager-associated-services'

export interface SecretManagerAssociatedExternalSecretsModalProps {
  secretManagerAccessId: string
  organizationId: string
  onClose: () => void
}

interface ExternalSecret {
  id: string
  variable_name: string
  external_secret_name: string
}

interface Service {
  service_id: string
  service_name: string
  service_type?: APIVariableScopeEnum
  externalSecrets: ExternalSecret[]
}

interface Environment {
  environment_id: string
  environment_name: string
  externalSecrets: ExternalSecret[]
  services: Service[]
}

interface Project {
  project_id: string
  project_name: string
  environments: Environment[]
}

function buildExternalSecretId({
  environment_id,
  service_id,
  variable_name,
  external_secret_name,
}: ExternalSecretAssociatedServiceResponse): string {
  return [service_id ?? environment_id, variable_name, external_secret_name].filter(Boolean).join('-')
}

function matchesSearch({
  item,
  searchValue,
}: {
  item: ExternalSecretAssociatedServiceResponse
  searchValue?: string
}): boolean {
  if (!searchValue) {
    return true
  }

  const search = searchValue.toLowerCase()

  return [
    item.project_name,
    item.environment_name,
    item.service_name,
    item.variable_name,
    item.external_secret_name,
  ].some((value) => value?.toLowerCase().includes(search))
}

function getServiceIconName(serviceType?: APIVariableScopeEnum): IconEnum {
  return match(serviceType)
    .with('APPLICATION', () => IconEnum.APPLICATION)
    .with('CONTAINER', () => IconEnum.CONTAINER)
    .with('HELM', () => IconEnum.HELM)
    .with('TERRAFORM', () => IconEnum.TERRAFORM)
    .with('JOB', () => IconEnum.CRON_JOB)
    .otherwise(() => IconEnum.SERVICES)
}

export function groupExternalSecretsByProjectEnvironment(
  data: ExternalSecretAssociatedServiceResponse[],
  searchValue?: string
): Project[] {
  const projects: Project[] = []

  data.forEach((item) => {
    if (!matchesSearch({ item, searchValue })) {
      return
    }

    let project = projects.find((proj) => proj.project_id === item.project_id)
    if (!project) {
      project = {
        project_id: item.project_id,
        project_name: item.project_name,
        environments: [],
      }
      projects.push(project)
    }

    let environment = project.environments.find((env) => env.environment_id === item.environment_id)
    if (!environment) {
      environment = {
        environment_id: item.environment_id,
        environment_name: item.environment_name,
        externalSecrets: [],
        services: [],
      }
      project.environments.push(environment)
    }

    const externalSecret = {
      id: buildExternalSecretId(item),
      variable_name: item.variable_name,
      external_secret_name: item.external_secret_name,
    }

    if (!item.service_id) {
      environment.externalSecrets.push(externalSecret)
      return
    }

    let service = environment.services.find((service) => service.service_id === item.service_id)
    if (!service) {
      service = {
        service_id: item.service_id,
        service_name: item.service_name ?? item.service_id,
        service_type: item.service_type,
        externalSecrets: [],
      }
      environment.services.push(service)
    }

    service.externalSecrets.push(externalSecret)
  })

  return projects
}

function getProjectsWithEnvironmentExternalSecrets(projects: Project[]): Project[] {
  return projects
    .map((project) => ({
      ...project,
      environments: project.environments
        .filter((environment) => environment.externalSecrets.length > 0)
        .map((environment) => ({ ...environment, services: [] })),
    }))
    .filter((project) => project.environments.length > 0)
}

function getProjectsWithServiceExternalSecrets(projects: Project[]): Project[] {
  return projects
    .map((project) => ({
      ...project,
      environments: project.environments
        .filter((environment) => environment.services.length > 0)
        .map((environment) => ({ ...environment, externalSecrets: [] })),
    }))
    .filter((project) => project.environments.length > 0)
}

function EmptyState() {
  return (
    <div className="px-5 py-4 text-center">
      <Icon iconName="wave-pulse" className="text-neutral-subtle" />
      <p className="mt-1 text-xs font-medium text-neutral-subtle">No value found</p>
    </div>
  )
}

export function SecretManagerAssociatedExternalSecretsModal({
  secretManagerAccessId,
  organizationId,
  onClose,
}: SecretManagerAssociatedExternalSecretsModalProps) {
  const { data: associatedExternalSecrets = [], isLoading } = useSecretManagerAssociatedServices({
    secretManagerAccessId,
  })
  const [searchValue, setSearchValue] = useState<string | undefined>()
  const normalizedSearch = searchValue?.trim() || undefined

  const groupedExternalSecrets = useMemo(
    () => groupExternalSecretsByProjectEnvironment(associatedExternalSecrets, normalizedSearch),
    [associatedExternalSecrets, normalizedSearch]
  )

  const environmentExternalSecrets = useMemo(
    () => associatedExternalSecrets.filter((externalSecret) => !externalSecret.service_id),
    [associatedExternalSecrets]
  )
  const serviceExternalSecrets = useMemo(
    () => associatedExternalSecrets.filter((externalSecret) => externalSecret.service_id),
    [associatedExternalSecrets]
  )

  const environmentTreeData = useMemo(
    () => getProjectsWithEnvironmentExternalSecrets(groupedExternalSecrets),
    [groupedExternalSecrets]
  )
  const serviceTreeData = useMemo(
    () => getProjectsWithServiceExternalSecrets(groupedExternalSecrets),
    [groupedExternalSecrets]
  )

  const hasEnvironmentExternalSecrets = environmentExternalSecrets.length > 0
  const hasServiceExternalSecrets = serviceExternalSecrets.length > 0
  const hasAnyExternalSecrets = associatedExternalSecrets.length > 0
  const noSearchResults =
    Boolean(normalizedSearch) &&
    hasAnyExternalSecrets &&
    environmentTreeData.length === 0 &&
    serviceTreeData.length === 0

  return (
    <Section className="p-6">
      <Heading className="mb-6 text-2xl text-neutral">
        Associated {pluralize(associatedExternalSecrets.length, 'external secret')}
      </Heading>
      {isLoading ? (
        <div className="flex h-40 items-start justify-center p-5">
          <LoaderSpinner className="w-5" />
        </div>
      ) : (
        <>
          <InputSearch
            className="mb-3"
            placeholder="Search by project, environment, service, or external secret name"
            onChange={(value) => setSearchValue(value)}
          />
          {noSearchResults || !hasAnyExternalSecrets ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {hasEnvironmentExternalSecrets && (
                <div>
                  <Heading level={3} className="mb-2 text-neutral">
                    {pluralize(environmentExternalSecrets.length, 'Environment external secret')}
                  </Heading>
                  {environmentTreeData.length > 0 ? (
                    <TreeView.Root
                      type="single"
                      collapsible
                      className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-2"
                    >
                      {environmentTreeData.map((project) => (
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
                                      to="/organization/$organizationId/project/$projectId/environment/$environmentId/variables"
                                      params={{
                                        organizationId,
                                        projectId: project.project_id,
                                        environmentId: environment.environment_id,
                                      }}
                                      className="text-sm"
                                    >
                                      {environment.environment_name}
                                    </Link>
                                  </TreeView.Trigger>
                                  <TreeView.Content>
                                    <ul>
                                      {environment.externalSecrets.map((externalSecret) => (
                                        <li key={externalSecret.id} className="border-l border-neutral">
                                          <Link
                                            color="brand"
                                            onClick={() => onClose()}
                                            to="/organization/$organizationId/project/$projectId/environment/$environmentId/variables"
                                            params={{
                                              organizationId,
                                              projectId: project.project_id,
                                              environmentId: environment.environment_id,
                                            }}
                                            className="flex items-center py-1.5 pl-5 text-sm"
                                          >
                                            <Icon iconName="lock-keyhole" iconStyle="regular" className="mr-2" />
                                            <span className="flex min-w-0 flex-col">
                                              <span className="truncate">{externalSecret.variable_name}</span>
                                              <span className="truncate text-xs text-neutral-subtle">
                                                {externalSecret.external_secret_name}
                                              </span>
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
                      No matching {pluralize(environmentExternalSecrets.length, 'environment external secret')}.
                    </p>
                  )}
                </div>
              )}
              {hasServiceExternalSecrets && (
                <div>
                  <Heading level={3} className="mb-2 text-neutral">
                    {pluralize(serviceExternalSecrets.length, 'Service external secret')}
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
                                      to="/organization/$organizationId/project/$projectId/environment/$environmentId/variables"
                                      params={{
                                        organizationId,
                                        projectId: project.project_id,
                                        environmentId: environment.environment_id,
                                      }}
                                      className="text-sm"
                                    >
                                      {environment.environment_name}
                                    </Link>
                                  </TreeView.Trigger>
                                  <TreeView.Content>
                                    {environment.services.map((service) => (
                                      <TreeView.Root key={service.service_id} type="single" collapsible>
                                        <TreeView.Item value={service.service_name}>
                                          <TreeView.Trigger>
                                            <Link
                                              color="brand"
                                              onClick={() => onClose()}
                                              to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/external-secrets"
                                              params={{
                                                organizationId,
                                                projectId: project.project_id,
                                                environmentId: environment.environment_id,
                                                serviceId: service.service_id,
                                              }}
                                              className="flex items-center text-sm"
                                            >
                                              <Icon
                                                name={getServiceIconName(service.service_type)}
                                                width={20}
                                                className="mr-2"
                                              />
                                              {service.service_name}
                                            </Link>
                                          </TreeView.Trigger>
                                          <TreeView.Content>
                                            <ul>
                                              {service.externalSecrets.map((externalSecret) => (
                                                <li key={externalSecret.id} className="border-l border-neutral">
                                                  <Link
                                                    color="brand"
                                                    onClick={() => onClose()}
                                                    to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables/external-secrets"
                                                    params={{
                                                      organizationId,
                                                      projectId: project.project_id,
                                                      environmentId: environment.environment_id,
                                                      serviceId: service.service_id,
                                                    }}
                                                    className="flex items-center py-1.5 pl-5 text-sm"
                                                  >
                                                    <Icon
                                                      iconName="lock-keyhole"
                                                      iconStyle="regular"
                                                      className="mr-2"
                                                    />
                                                    <span className="flex min-w-0 flex-col">
                                                      <span className="truncate">{externalSecret.variable_name}</span>
                                                      <span className="truncate text-xs text-neutral-subtle">
                                                        {externalSecret.external_secret_name}
                                                      </span>
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
                              </TreeView.Root>
                            ))}
                          </TreeView.Content>
                        </TreeView.Item>
                      ))}
                    </TreeView.Root>
                  ) : (
                    <p className="text-xs text-neutral-subtle">
                      No matching {pluralize(serviceExternalSecrets.length, 'service external secret')}.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Section>
  )
}

export default SecretManagerAssociatedExternalSecretsModal
