import {
  type GitTokenAssociatedServiceResponse,
  type GitTokenAssociatedServiceType,
  type GitTokenResponse,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { APPLICATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Accordion, Heading, Icon, InputSearch, Link, LoaderSpinner, Section } from '@qovery/shared/ui'
import { useGitTokenAssociatedServices } from '../hooks/use-git-token-associated-services/use-git-token-associated-services'

export interface GitTokenServicesListModalProps {
  organizationId: string
  gitTokenId: string
  onClose: (response?: GitTokenResponse) => void
  associatedServicesCount: number
}

interface Service {
  service_id: string
  service_name: string
  service_type: GitTokenAssociatedServiceType
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

export function groupByProjectEnvironmentsServices(data: GitTokenAssociatedServiceResponse[], searchValue?: string) {
  const projects: Project[] = []

  data.forEach(
    ({ project_id, project_name, environment_id, environment_name, service_id, service_name, service_type }) => {
      // Check if the search value is present in the project, environment or service name
      if (
        searchValue === undefined ||
        project_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        environment_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        service_name.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        let project = projects.find((proj) => proj.project_id === project_id)
        if (!project) {
          project = {
            project_id,
            project_name,
            environments: [],
          }
          projects.push(project)
        }

        let environment = project.environments.find((env) => env.environment_id === environment_id)
        if (!environment) {
          environment = {
            environment_id,
            environment_name,
            services: [],
          }
          project.environments.push(environment)
        }

        environment.services.push({ service_id, service_name, service_type })
      }
    }
  )

  return projects
}

export function GitTokenServicesListModal({
  organizationId,
  gitTokenId,
  associatedServicesCount,
  onClose,
}: GitTokenServicesListModalProps) {
  const { data: gitTokenAssociatedServices = [], isLoading } = useGitTokenAssociatedServices({
    organizationId,
    gitTokenId,
  })
  const [searchValue, setSearchValue] = useState<string | undefined>()

  const data = groupByProjectEnvironmentsServices(gitTokenAssociatedServices, searchValue)

  return (
    <Section className="p-6">
      <Heading className="text-neutral-400 mb-6 text-2xl">Associated services ({associatedServicesCount})</Heading>
      {isLoading ? (
        <div className="flex items-start justify-center p-5 h-40">
          <LoaderSpinner className="w-5" />
        </div>
      ) : (
        <>
          <InputSearch
            className="mb-3"
            placeholder="Search by project, environment, service name"
            onChange={(value) => setSearchValue(value)}
          />
          {data.length > 0 ? (
            <Accordion.Root
              type="single"
              collapsible
              className="bg-neutral-100 border-x border-t border-neutral-200 rounded-sm"
            >
              {data.map((project) => (
                <Accordion.Item key={project.project_id} value={project.project_name} className="bg-neutral-100">
                  <Accordion.Trigger className="w-full bg-transparent flex-row-reverse justify-between h-9 border-b border-neutral-200 font-medium text-xs pl-4 pr-0">
                    {project.project_name}
                  </Accordion.Trigger>
                  <Accordion.Content className="p-0">
                    {project.environments.map((environment) => (
                      <Accordion.Root key={environment.environment_id} type="single" collapsible>
                        <Accordion.Item value={environment.environment_name}>
                          <Accordion.Trigger className="w-full bg-transparent flex-row-reverse justify-between h-9 border-b border-neutral-200 font-medium text-xs pl-10 pr-0">
                            <Link
                              color="brand"
                              size="xs"
                              onClick={() => onClose()}
                              to={SERVICES_URL(organizationId, project.project_id, environment.environment_id)}
                            >
                              {environment.environment_name}
                            </Link>
                          </Accordion.Trigger>
                          <Accordion.Content className="p-0 border-b border-neutral-200">
                            <ul>
                              {environment.services.map((service) => (
                                <li
                                  key={service.service_id}
                                  className="w-full flex items-center h-9 border-b last:border-b-0 last:rounded-sm border-neutral-200"
                                >
                                  <Link
                                    color="brand"
                                    size="xs"
                                    onClick={() => onClose()}
                                    to={APPLICATION_URL(
                                      organizationId,
                                      project.project_id,
                                      environment.environment_id,
                                      service.service_id
                                    )}
                                    className="pl-16"
                                  >
                                    <Icon
                                      name={match(service.service_type)
                                        .with('CRON', 'LIFECYCLE', () => `${service.service_type}_JOB`)
                                        .otherwise(() => service.service_type)}
                                      width={20}
                                      className="mr-2"
                                    />
                                    {service.service_name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </Accordion.Content>
                        </Accordion.Item>
                      </Accordion.Root>
                    ))}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          ) : (
            <div className="text-center py-4 px-5">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1">No value found</p>
            </div>
          )}
        </>
      )}
    </Section>
  )
}

export default GitTokenServicesListModal
