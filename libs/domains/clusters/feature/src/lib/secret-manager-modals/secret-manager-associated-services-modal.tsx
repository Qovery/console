import { type ServiceTypeEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { Heading, Icon, InputSearch, Link, Section, TreeView } from '@qovery/shared/ui'

export type SecretManagerAssociatedService = {
  service_id: string
  service_name: string
  service_type: ServiceTypeEnum
}

export type SecretManagerAssociatedEnvironment = {
  environment_id: string
  environment_name: string
  services: SecretManagerAssociatedService[]
}

export type SecretManagerAssociatedProject = {
  project_id: string
  project_name: string
  environments: SecretManagerAssociatedEnvironment[]
}

export interface SecretManagerAssociatedServicesModalProps {
  associatedItems: SecretManagerAssociatedProject[]
  organizationId: string
  title: string
  description: string
  onClose: () => void
}

function groupByProjectEnvironmentsServices(
  data: SecretManagerAssociatedProject[],
  searchValue?: string
): SecretManagerAssociatedProject[] {
  if (!searchValue) {
    return data
  }

  const search = searchValue.toLowerCase()

  return data
    .map((project) => {
      const environments = project.environments
        .map((environment) => ({
          ...environment,
          services: environment.services.filter(
            (service) =>
              project.project_name.toLowerCase().includes(search) ||
              environment.environment_name.toLowerCase().includes(search) ||
              service.service_name.toLowerCase().includes(search)
          ),
        }))
        .filter(
          (environment) =>
            project.project_name.toLowerCase().includes(search) ||
            environment.environment_name.toLowerCase().includes(search) ||
            environment.services.length > 0
        )

      return { ...project, environments }
    })
    .filter(
      (project) =>
        project.project_name.toLowerCase().includes(search) ||
        project.environments.some(
          (environment) =>
            environment.services.length > 0 || environment.environment_name.toLowerCase().includes(search)
        )
    )
}

export function SecretManagerAssociatedServicesModal({
  associatedItems,
  organizationId,
  title,
  description,
  onClose,
}: SecretManagerAssociatedServicesModalProps) {
  const [searchValue, setSearchValue] = useState<string | undefined>()
  const treeData = groupByProjectEnvironmentsServices(associatedItems, searchValue)

  return (
    <Section className="p-6">
      <Heading className="mb-2 text-2xl text-neutral">{title}</Heading>
      <p className="mb-6 text-sm text-neutral-subtle">{description}</p>
      <InputSearch
        className="mb-3"
        placeholder="Search by project, environment, service name"
        onChange={(value) => setSearchValue(value)}
      />
      {treeData.length > 0 ? (
        <TreeView.Root
          type="single"
          collapsible
          className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-2"
        >
          {treeData.map((project) => (
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
                            <li key={service.service_id} className="border-l border-neutral">
                              <Link
                                color="brand"
                                onClick={() => onClose()}
                                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId"
                                params={{
                                  organizationId,
                                  environmentId: environment.environment_id,
                                  serviceId: service.service_id,
                                  projectId: project.project_id,
                                }}
                                className="flex items-center py-1.5 pl-5 text-sm"
                              >
                                <Icon
                                  name={match(service.service_type)
                                    .with('APPLICATION', () => 'APPLICATION')
                                    .with('CONTAINER', () => 'CONTAINER')
                                    .with('DATABASE', () => 'DATABASE')
                                    .with('HELM', () => 'HELM')
                                    .with('JOB', () => 'JOB')
                                    .with('TERRAFORM', () => 'TERRAFORM')
                                    .exhaustive()}
                                  width={20}
                                  className="mr-2"
                                />
                                {service.service_name}
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
        <div className="px-5 py-4 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-subtle" />
          <p className="mt-1 text-xs font-medium text-neutral-subtle">No value found</p>
        </div>
      )}
    </Section>
  )
}
