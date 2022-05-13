import { Environment, Project, Application, Organization } from 'qovery-typescript-axios'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { Icon } from '@console/shared/ui'
import {
  APPLICATIONS_GENERAL_URL,
  APPLICATIONS_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
} from '@console/shared/utils'
import BreadcrumbItem from '../breadcrumb-item/breadcrumb-item'

export interface BreadcrumbProps {
  organizations: Organization[]
  projects?: Project[]
  environments?: Environment[]
  applications?: Application[]
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { organizations, projects, environments, applications } = props
  const { organizationId, projectId, environmentId, applicationId } = useParams()
  const { pathname } = useLocation()

  const currentApplicationName = applications?.find((application) => applicationId === application.id)?.name
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
            contentLeft:
              organizationId === organization.id ? (
                <Icon name="icon-solid-check" className="text-sm text-success-400" />
              ) : (
                ''
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
            contentLeft:
              projectId === project.id ? <Icon name="icon-solid-check" className="text-sm text-success-400" /> : '',
          }))
        : [],
    },
  ]

  const environmentMenu = [
    {
      title: 'Environments',
      search: true,
      items: environments
        ? environments?.map((environment: Environment) => ({
            name: environment.name,
            link: {
              url: `${APPLICATIONS_URL(organizationId, projectId, environment.id)}${APPLICATIONS_GENERAL_URL}`,
            },
            contentLeft:
              environmentId === environment.id ? (
                <Icon name="icon-solid-check" className="text-sm text-success-400" />
              ) : (
                ''
              ),
          }))
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
            link={OVERVIEW_URL(organizationId, projectId)}
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
                link={APPLICATIONS_URL(organizationId, projectId, environmentId)}
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
            <span className="text-sm text-text-500 font-medium">{currentApplicationName}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default Breadcrumb
