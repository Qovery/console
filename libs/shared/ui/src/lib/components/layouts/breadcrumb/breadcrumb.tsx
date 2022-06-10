import { Application, Database, Environment, Organization, Project } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { Icon, MenuItemProps, StatusChip } from '@console/shared/ui'
import {
  SERVICES_GENERAL_URL,
  SERVICES_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  APPLICATION_URL,
  APPLICATION_GENERAL_URL,
} from '@console/shared/utils'
import BreadcrumbItem from '../breadcrumb-item/breadcrumb-item'
import { ApplicationEntity, EnvironmentEntity } from '@console/shared/interfaces'
import { IconEnum, ServicesEnum } from '@console/shared/enums'

export interface BreadcrumbProps {
  organizations: Organization[]
  projects?: Project[]
  environments?: Environment[]
  applications?: Application[]
  databases?: Database[]
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { organizations, projects, environments, applications } = props
  const { organizationId, projectId, environmentId, applicationId } = useParams()
  const { pathname } = useLocation()

  const currentOrganization = organizations?.find((organization) => organizationId === organization.id)

  const organizationsMenu = [
    {
      title: 'Organizations',
      search: true,
      items: organizations
        ? organizations?.map((organization: Organization) => ({
            name: organization.name,
            link: {
              url: ORGANIZATION_URL(organization.id),
            },
            contentLeft: (
              <Icon
                name="icon-solid-check"
                className={`text-sm ${organizationId === organization.id ? 'text-success-400' : 'text-transparent'}`}
              />
            ),
            contentRight: (
              <>
                {organization.logo_url && (
                  <img className="w-4 h-auto" src={organization.logo_url} alt={organization.name} />
                )}
              </>
            ),
          }))
        : [],
    },
  ]

  const projectMenu = [
    {
      title: 'Projects',
      search: true,
      items: projects
        ? projects?.map((project: Project) => ({
            name: project.name,
            link: {
              url: OVERVIEW_URL(project.organization?.id, project.id),
            },
            contentLeft: (
              <Icon
                name="icon-solid-check"
                className={`text-sm ${projectId === project.id ? 'text-success-400' : 'text-transparent'}`}
              />
            ),
          }))
        : [],
    },
  ]

  const environmentMenu = [
    {
      title: 'Environments',
      search: true,
      items: environments
        ? environments?.map((environment: EnvironmentEntity) => ({
            name: environment.name,
            link: {
              url: `${SERVICES_URL(organizationId, projectId, environment.id)}${SERVICES_GENERAL_URL}`,
            },
            contentLeft: (
              <div className="flex items-center">
                <StatusChip status={environment.status?.state} />
                <div className="ml-3 mt-0.5">
                  {environment.cloud_provider.provider && <Icon name={`${environment.cloud_provider.provider}_GRAY`} />}
                </div>
              </div>
            ),
            isActive: environmentId === environment.id,
          }))
        : [],
    },
  ]

  const applicationMenu = [
    {
      title: 'Applications',
      search: true,
      items: applications
        ? (applications?.map((application: ApplicationEntity) => ({
            name: application.name,
            link: {
              url: `${APPLICATION_URL(
                organizationId,
                projectId,
                environmentId,
                application.id
              )}${APPLICATION_GENERAL_URL}`,
            },
            contentLeft: (
              <div className="flex items-center">
                <StatusChip status={application.status?.state} />
                <div className="ml-3 mt-[1px]">
                  <Icon
                    name={!(application as ApplicationEntity).build_mode ? IconEnum.APPLICATION : IconEnum.DATABASE}
                    width="16"
                  />
                </div>
              </div>
            ),
            isActive: applicationId === application.id,
          })) as MenuItemProps[])
        : [],
    },
  ]

  const squareContent = (text: string | undefined, margin = 'mr-2 mt-0.5') => (
    <div
      className={`w-4 h-4.5 flex items-center justify-center text-xs text-text-400 text-center bg-element-light-lighter-400 rounded-sm font-bold ${margin}`}
    >
      {text}
    </div>
  )

  if (organizations?.length === 0) return <div />

  return (
    <div className="flex h-full items-center cursor-pointer">
      {currentOrganization?.logo_url ? (
        <img
          src={currentOrganization?.logo_url}
          className="w-4 h-auto mt-0.5 mr-0.5"
          alt={`${currentOrganization?.name} organization`}
        />
      ) : (
        squareContent(currentOrganization?.name.charAt(0), 'mt-0.5')
      )}
      {organizationId && (
        <BreadcrumbItem
          data={projects}
          menuItems={organizationsMenu}
          paramId={organizationId}
          link={ORGANIZATION_URL(organizationId)}
        />
      )}
      {projectId && (
        <>
          <div className="w-4 h-auto text-text-200 text-center ml-2 mr-3">/</div>
          <BreadcrumbItem
            data={projects}
            menuItems={projectMenu}
            paramId={projectId}
            link={`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_GENERAL_URL}`}
            // link={OVERVIEW_URL(organizationId, projectId)}
          />
        </>
      )}
      {(environmentId || projectId || applicationId) && pathname !== OVERVIEW_URL(organizationId, projectId) && (
        <>
          <div className="w-4 h-auto text-text-200 text-center ml-2 mr-3">/</div>
          <div className="flex items-center">
            <Link to={`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_GENERAL_URL}`}>
              {squareContent('E')}
            </Link>
            {!environmentId ? (
              <span className="text-sm text-text-500 font-medium">Environments</span>
            ) : (
              <BreadcrumbItem
                data={environments}
                menuItems={environmentMenu}
                paramId={environmentId}
                link={SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL}
              />
            )}
          </div>
        </>
      )}
      {applicationId && (
        <>
          <div className="w-4 h-auto text-text-200 text-center ml-2 mr-3">/</div>
          <div className="flex items-center">
            {squareContent('S')}
            <BreadcrumbItem
              data={applications}
              menuItems={applicationMenu}
              paramId={applicationId}
              link={SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Breadcrumb
