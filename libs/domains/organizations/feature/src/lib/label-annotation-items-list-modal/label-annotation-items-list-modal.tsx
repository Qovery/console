import {
  type AnnotationsGroupAssociatedItemType,
  type OrganizationAnnotationsGroupAssociatedItemsResponseListResultsInner,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { APPLICATION_URL, SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Heading, Icon, InputSearch, Link, LoaderSpinner, Section, TreeView } from '@qovery/shared/ui'
import { useAnnotationsGroupAssociatedItems } from '../hooks/use-annotations-group-associated-items/use-annotations-group-associated-items'
import { useLabelsGroupAssociatedItems } from '../hooks/use-labels-group-associated-items/use-labels-group-associated-items'

interface Service {
  service_id: string
  service_name: string
  service_type: AnnotationsGroupAssociatedItemType
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

export function groupByProjectEnvironmentsServices(
  data: OrganizationAnnotationsGroupAssociatedItemsResponseListResultsInner[],
  searchValue?: string
) {
  const projects: Project[] = []

  data.forEach(
    ({
      project_id = '',
      project_name = '',
      environment_id = '',
      environment_name = '',
      item_id,
      item_name = '',
      item_type,
    }) => {
      // Check if the search value is present in the project, environment or service name
      if (
        searchValue === undefined ||
        project_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        environment_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item_name.toLowerCase().includes(searchValue.toLowerCase())
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

        environment.services.push({ service_id: item_id, service_name: item_name, service_type: item_type })
      }
    }
  )

  return projects
}

export interface LabelAnnotationItemsListModalProps {
  type: 'label' | 'annotation'
  organizationId: string
  groupId: string
  associatedItemsCount: number
  onClose: () => void
}

export function LabelAnnotationItemsListModal({
  type,
  organizationId,
  groupId,
  associatedItemsCount,
  onClose,
}: LabelAnnotationItemsListModalProps) {
  const { data: labelsGroupAssociatedItems = [], isLoading: labelsGroupIsLoading } = useLabelsGroupAssociatedItems({
    organizationId,
    labelsGroupId: groupId,
    enabled: type === 'label',
  })
  const { data: annotationsGroupAssociatedItems = [], isLoading: annotationsGroupIsLoading } =
    useAnnotationsGroupAssociatedItems({
      organizationId,
      annotationsGroupId: groupId,
      enabled: type === 'annotation',
    })

  const [searchValue, setSearchValue] = useState<string | undefined>()

  const data = groupByProjectEnvironmentsServices(
    type === 'label' ? labelsGroupAssociatedItems : annotationsGroupAssociatedItems,
    searchValue
  )

  const isLoading = type === 'label' ? labelsGroupIsLoading : annotationsGroupIsLoading

  return (
    <Section className="p-6">
      <Heading className="mb-6 text-2xl text-neutral-400">Associated services ({associatedItemsCount})</Heading>
      {isLoading ? (
        <div className="flex h-40 items-start justify-center p-5">
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
            <TreeView.Root
              type="single"
              collapsible
              className="rounded border border-neutral-250 bg-neutral-100 px-4 py-2"
            >
              {data.map((project) => (
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
                              to={
                                SERVICES_URL(organizationId, project.project_id, environment.environment_id) +
                                SERVICES_GENERAL_URL
                              }
                              className="text-sm"
                            >
                              {environment.environment_name}
                            </Link>
                          </TreeView.Trigger>
                          <TreeView.Content>
                            <ul>
                              {environment.services.map((service) => (
                                <li key={service.service_id} className=" border-neutral border-l">
                                  <Link
                                    color="brand"
                                    onClick={() => onClose()}
                                    to={APPLICATION_URL(
                                      organizationId,
                                      project.project_id,
                                      environment.environment_id,
                                      service.service_id
                                    )}
                                    className="flex items-center py-1.5 pl-5 text-sm"
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
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="mt-1 text-xs font-medium text-neutral-350">No value found</p>
            </div>
          )}
        </>
      )}
    </Section>
  )
}

export default LabelAnnotationItemsListModal
