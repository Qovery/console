import equal from 'fast-deep-equal'
import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { memo, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ServiceStateChip, useServices } from '@qovery/domains/services/feature'
import { IconEnum } from '@qovery/shared/enums'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_GENERAL_URL,
  APPLICATION_URL,
  CLUSTERS_URL,
  CLUSTER_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ENVIRONMENT_LOGS_URL,
  INFRA_LOGS_URL,
  OVERVIEW_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacySize,
  Icon,
  IconAwesomeEnum,
  type MenuData,
  type MenuItemProps,
  Tooltip,
} from '@qovery/shared/ui'
import BreadcrumbItem from '../breadcrumb-item/breadcrumb-item'

export interface BreadcrumbProps {
  organizations: Organization[]
  createProjectModal: () => void
  clusters?: ClusterEntity[]
  projects?: Project[]
  environments?: Environment[]
}

export function BreadcrumbMemo(props: BreadcrumbProps) {
  const { organizations, clusters, projects, environments, createProjectModal } = props
  const { organizationId, projectId, environmentId, applicationId, databaseId, clusterId } = useParams()

  const location = useLocation()
  const navigate = useNavigate()
  const currentOrganization = organizations?.find((organization) => organizationId === organization.id)

  const locationIsApplicationLogs = location.pathname.includes(
    ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)
  )
  const locationIsDeploymentLogs = location.pathname.includes(
    ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)
  )

  const locationIsClusterLogs = location.pathname.includes(INFRA_LOGS_URL(organizationId, clusterId))

  const matchLogsRoute =
    location.pathname.includes(INFRA_LOGS_URL(organizationId, clusterId)) ||
    locationIsApplicationLogs ||
    locationIsDeploymentLogs

  const clustersMenu: MenuData = [
    {
      title: 'Clusters',
      sortAlphabetically: true,
      search: true,
      items: clusters
        ? clusters?.map((cluster: Cluster) => ({
            name: cluster.name,
            link: {
              url: matchLogsRoute
                ? INFRA_LOGS_URL(organizationId, cluster.id)
                : CLUSTER_URL(organizationId, cluster.id),
            },
            contentLeft: (
              <Icon
                name="icon-solid-check"
                className={`text-sm ${clusterId === cluster.id ? 'text-green-400' : 'text-transparent'}`}
              />
            ),
          }))
        : [],
    },
  ]

  const projectMenu: MenuData = [
    {
      title: 'Projects',
      search: true,
      sortAlphabetically: true,
      button: {
        label: (
          <span>
            New <Icon name={IconAwesomeEnum.CIRCLE_PLUS} className="ml-0.5" />
          </span>
        ),
        onClick: () => createProjectModal(),
      },
      items: projects
        ? projects?.map((project: Project) => ({
            name: project.name,
            link: {
              url: OVERVIEW_URL(project.organization?.id, project.id),
            },
            contentLeft: (
              <Icon
                name="icon-solid-check"
                className={`text-sm ${projectId === project.id ? 'text-green-400' : 'text-transparent'}`}
              />
            ),
          }))
        : [],
    },
  ]

  const environmentMenu: MenuData = [
    {
      title: 'Environments',
      search: true,
      sortAlphabetically: true,
      items: environments
        ? environments?.map((environment: Environment) => ({
            name: environment.name,
            link: {
              url: `${SERVICES_URL(organizationId, projectId, environment.id)}${SERVICES_GENERAL_URL}`,
            },
            contentLeft: environment.cloud_provider.provider && (
              <Icon className="mt-0.5" name={`${environment.cloud_provider.provider}_GRAY`} />
            ),
            isActive: environmentId === environment.id,
          }))
        : [],
    },
  ]

  const { data: services = [] } = useServices({ environmentId })

  const applicationMenu: MenuData = [
    {
      title: 'Services',
      search: true,
      sortAlphabetically: true,
      items: services.map((service) => ({
        name: service.name,
        link: {
          url:
            service.serviceType === 'DATABASE'
              ? `${DATABASE_URL(organizationId, projectId, environmentId, service.id)}${DATABASE_GENERAL_URL}`
              : `${APPLICATION_URL(organizationId, projectId, environmentId, service.id)}${APPLICATION_GENERAL_URL}`,
        },
        contentLeft: (
          <div className="flex items-center">
            <ServiceStateChip mode="deployment" environmentId={service.environment?.id} serviceId={service.id} />
            <div className="ml-3 mt-[1px]">
              <Icon name={service.serviceType === 'DATABASE' ? IconEnum.DATABASE : IconEnum.APPLICATION} width="16" />
            </div>
          </div>
        ),
        isActive: applicationId === service.id,
      })) as MenuItemProps[],
    },
  ]

  const squareContent = (text: string | undefined, margin = 'mr-2 mt-0.5') => (
    <div
      className={`w-4 h-4.5 flex items-center justify-center text-xs text-neutral-350 text-center bg-neutral-200 rounded-sm font-bold uppercase ${margin}`}
    >
      {text}
    </div>
  )

  const linkToCloseLogs = locationIsClusterLogs
    ? CLUSTERS_URL(organizationId)
    : SERVICES_URL(organizationId, projectId, environmentId)

  useEffect(() => {
    const bindTouch = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && matchLogsRoute) navigate(linkToCloseLogs)
    }
    document.addEventListener('keydown', bindTouch, false)

    return () => {
      document.removeEventListener('keydown', bindTouch, false)
    }
  }, [linkToCloseLogs, navigate, matchLogsRoute])

  if (organizations?.length === 0) return <div />

  return (
    <div className="flex justify-between w-full">
      <div className="flex h-full items-center">
        {organizationId && (projectId || clusterId) && (
          <Tooltip content={currentOrganization?.name || ''}>
            <div className="mr-2">
              {currentOrganization?.logo_url ? (
                <img
                  src={currentOrganization?.logo_url}
                  className="h-4"
                  alt={`${currentOrganization?.name} organization`}
                />
              ) : (
                squareContent(currentOrganization?.name.charAt(0), '')
              )}
            </div>
          </Tooltip>
        )}
        {clusterId && (
          <BreadcrumbItem
            isLast={!projectId}
            label="Cluster"
            data={clusters}
            menuItems={clustersMenu}
            paramId={clusterId}
            link={matchLogsRoute ? INFRA_LOGS_URL(organizationId, clusterId) : CLUSTER_URL(organizationId, clusterId)}
          />
        )}
        {projectId && (
          <BreadcrumbItem
            isLast={!environmentId}
            label="Project"
            data={projects}
            menuItems={projectMenu}
            paramId={projectId}
            link={`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_GENERAL_URL}`}
          />
        )}
        {environmentId && (
          <>
            <div className="w-4 h-auto text-neutral-300 text-center mx-3 mt-3">/</div>
            <div className="flex items-center">
              {environmentId && (
                <>
                  <BreadcrumbItem
                    isLast={!(applicationId || databaseId)}
                    label="Environment"
                    data={environments}
                    menuItems={environmentMenu}
                    paramId={environmentId}
                    link={SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL}
                  />
                  {(applicationId || databaseId) && (
                    <>
                      <div className="w-4 h-auto text-neutral-300 text-center mx-3 mt-3">/</div>
                      <div className="flex items-center">
                        <BreadcrumbItem
                          isLast={true}
                          label="Service"
                          data={services}
                          menuItems={applicationMenu}
                          paramId={applicationId || databaseId || ''}
                          link={
                            applicationId
                              ? APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
                                APPLICATION_GENERAL_URL
                              : DATABASE_URL(organizationId, projectId, environmentId, databaseId) +
                                DATABASE_GENERAL_URL
                          }
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
        {matchLogsRoute && (
          <div className="flex">
            <div className="flex items-center text-purple-300 bg-purple-800 font-medium text-ssm px-1.5 h-6 rounded-[3px] ml-3 mt-2">
              LOGS
            </div>
          </div>
        )}
      </div>
      {(locationIsApplicationLogs || locationIsDeploymentLogs || locationIsClusterLogs) && (
        <div className="ml-auto">
          <ButtonIcon
            icon={IconAwesomeEnum.XMARK}
            style={ButtonIconStyle.DARK}
            size={ButtonLegacySize.LARGE}
            link={linkToCloseLogs}
          />
        </div>
      )}
    </div>
  )
}

export const Breadcrumb = memo(BreadcrumbMemo, (prevProps, nextProps) => {
  return equal(prevProps, nextProps)
})
