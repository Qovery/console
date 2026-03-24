import { useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { Heading, Icon, InputSearch, Link, Section, TreeView } from '@qovery/shared/ui'

interface FakeService {
  service_id: string
  service_name: string
  service_type: 'APPLICATION' | 'CONTAINER' | 'DATABASE' | 'CRON'
}

interface FakeEnvironment {
  environment_id: string
  environment_name: string
  services: FakeService[]
}

interface FakeProject {
  project_id: string
  project_name: string
  environments: FakeEnvironment[]
}

export interface ArgoCdAssociatedServicesModalProps {
  organizationId: string
  clusterName: string
  associatedItemsCount: number
  onClose: () => void
}

const SERVICE_TYPES: FakeService['service_type'][] = ['APPLICATION', 'CONTAINER', 'DATABASE', 'CRON']

const createFakeProjects = (clusterName: string, associatedItemsCount: number): FakeProject[] => {
  const safeCount = Math.max(1, associatedItemsCount)
  const projects: FakeProject[] = [
    {
      project_id: 'fake-project-core',
      project_name: `${clusterName} Core`,
      environments: [
        {
          environment_id: 'fake-env-core-prod',
          environment_name: 'production',
          services: [],
        },
        {
          environment_id: 'fake-env-core-staging',
          environment_name: 'staging',
          services: [],
        },
      ],
    },
    {
      project_id: 'fake-project-platform',
      project_name: `${clusterName} Platform`,
      environments: [
        {
          environment_id: 'fake-env-platform-prod',
          environment_name: 'production',
          services: [],
        },
        {
          environment_id: 'fake-env-platform-staging',
          environment_name: 'staging',
          services: [],
        },
      ],
    },
  ]

  for (let index = 0; index < safeCount; index++) {
    const projectIndex = index % projects.length
    const environmentIndex = Math.floor(index / projects.length) % projects[projectIndex].environments.length
    const serviceType = SERVICE_TYPES[index % SERVICE_TYPES.length]

    projects[projectIndex].environments[environmentIndex].services.push({
      service_id: `fake-service-${index + 1}`,
      service_name: `service-${index + 1}`,
      service_type: serviceType,
    })
  }

  return projects
}

const filterProjects = (projects: FakeProject[], searchValue?: string): FakeProject[] => {
  if (!searchValue) {
    return projects
  }

  const search = searchValue.toLowerCase()

  return projects.reduce<FakeProject[]>((acc, project) => {
    const projectMatches = project.project_name.toLowerCase().includes(search)

    const environments = project.environments.reduce<FakeEnvironment[]>((environmentsAcc, environment) => {
      const environmentMatches = environment.environment_name.toLowerCase().includes(search)
      const services = environment.services.filter(
        (service) =>
          projectMatches || environmentMatches || service.service_name.toLowerCase().includes(search)
      )

      if (services.length > 0) {
        environmentsAcc.push({
          ...environment,
          services,
        })
      }

      return environmentsAcc
    }, [])

    if (environments.length > 0) {
      acc.push({
        ...project,
        environments,
      })
    }

    return acc
  }, [])
}

export function ArgoCdAssociatedServicesModal({
  organizationId,
  clusterName,
  associatedItemsCount,
  onClose,
}: ArgoCdAssociatedServicesModalProps) {
  const [searchValue, setSearchValue] = useState<string | undefined>()

  const fakeProjects = useMemo(
    () => createFakeProjects(clusterName, associatedItemsCount),
    [clusterName, associatedItemsCount]
  )
  const filteredProjects = useMemo(() => filterProjects(fakeProjects, searchValue), [fakeProjects, searchValue])

  return (
    <Section className="p-6">
      <Heading className="mb-6 text-2xl text-neutral">Associated services ({associatedItemsCount})</Heading>
      <InputSearch
        className="mb-3"
        placeholder="Search by project, environment, service name"
        onChange={(value) => setSearchValue(value)}
      />
      {filteredProjects.length > 0 ? (
        <TreeView.Root type="single" collapsible className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-2">
          {filteredProjects.map((project) => (
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
                                  serviceId: service.service_id,
                                  projectId: project.project_id,
                                }}
                                className="flex items-center py-1.5 pl-5 text-sm"
                              >
                                <Icon
                                  name={match(service.service_type)
                                    .with('CRON', () => 'CRON_JOB')
                                    .otherwise((serviceType) => serviceType)}
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

export default ArgoCdAssociatedServicesModal
