import equal from 'fast-deep-equal'
import { Database, Environment, Organization, Project } from 'qovery-typescript-axios'
import React, { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import { ApplicationEntity, ClusterEntity, DatabaseEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  APPLICATION_GENERAL_URL,
  APPLICATION_LOGS_URL,
  APPLICATION_URL,
  CLUSTERS_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  INFRA_LOGS_URL,
  OVERVIEW_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import ButtonIcon, { ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import { ButtonSize } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import { MenuItemProps } from '../../menu/menu-item/menu-item'
import StatusChip from '../../status-chip/status-chip'
import Tooltip from '../../tooltip/tooltip'
import BreadcrumbItem from '../breadcrumb-item/breadcrumb-item'

export interface BreadcrumbProps {
  organizations: Organization[]
  createProjectModal: () => void
  clusters?: ClusterEntity[]
  projects?: Project[]
  environments?: Environment[]
  applications?: ApplicationEntity[]
  databases?: Database[]
}

export function BreadcrumbMemo(props: BreadcrumbProps) {
  const { organizations, clusters, projects, environments, applications, databases, createProjectModal } = props
  const { organizationId, projectId, environmentId, applicationId, databaseId, clusterId } = useParams()

  const location = useLocation()
  const navigate = useNavigate()
  const currentOrganization = organizations?.find((organization) => organizationId === organization.id)

  const locationIsApplicationLogs = location.pathname.includes(
    APPLICATION_LOGS_URL(organizationId, projectId, environmentId, applicationId)
  )
  const locationIsDeploymentLogs = location.pathname.includes(
    DEPLOYMENT_LOGS_URL(organizationId, projectId, environmentId)
  )

  const locationIsClusterLogs = location.pathname.includes(INFRA_LOGS_URL(organizationId, clusterId))

  const matchLogsRoute =
    location.pathname.includes(INFRA_LOGS_URL(organizationId, clusterId)) ||
    locationIsApplicationLogs ||
    locationIsDeploymentLogs

  const projectMenu = [
    {
      title: 'Projects',
      search: true,
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

  const mergedServices =
    applications && databases && ([...applications, ...databases] as ApplicationEntity[] | DatabaseEntity[])

  const applicationMenu = [
    {
      title: 'Services',
      search: true,
      items: applications
        ? (mergedServices?.map((service: ApplicationEntity | DatabaseEntity) => ({
            name: service.name,
            link: {
              url: (service as DatabaseEntity).type
                ? `${DATABASE_URL(organizationId, projectId, environmentId, service.id)}${DATABASE_GENERAL_URL}`
                : `${APPLICATION_URL(organizationId, projectId, environmentId, service.id)}${APPLICATION_GENERAL_URL}`,
            },
            contentLeft: (
              <div className="flex items-center">
                <StatusChip status={service.status?.state} />
                <div className="ml-3 mt-[1px]">
                  <Icon name={(service as DatabaseEntity).type ? IconEnum.DATABASE : IconEnum.APPLICATION} width="16" />
                </div>
              </div>
            ),
            isActive: applicationId === service.id,
          })) as MenuItemProps[])
        : [],
    },
  ]

  const squareContent = (text: string | undefined, margin = 'mr-2 mt-0.5') => (
    <div
      className={`w-4 h-4.5 flex items-center justify-center text-xs text-text-400 text-center bg-element-light-lighter-400 rounded-sm font-bold uppercase ${margin}`}
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
        {organizationId && (
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
            menuItems={[]}
            paramId={clusterId}
            link={INFRA_LOGS_URL(organizationId, clusterId)}
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
            <div className="w-4 h-auto text-element-light-lighter-600 text-center mx-3 mt-3">/</div>
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
                      <div className="w-4 h-auto text-element-light-lighter-600 text-center mx-3 mt-3">/</div>
                      <div className="flex items-center">
                        <BreadcrumbItem
                          isLast={true}
                          label="Service"
                          data={mergedServices}
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
            <div className="w-4 h-auto text-element-light-lighter-600 text-center mx-3 mt-3">/</div>
            <div className="flex items-center text-accent1-300 bg-accent1-800 font-medium text-xs px-2.5 py-1 rounded-[35px] mt-2">
              LOGS
            </div>
          </div>
        )}
      </div>
      {(locationIsApplicationLogs || locationIsDeploymentLogs || locationIsClusterLogs) && (
        <div className="ml-auto">
          <ButtonIcon
            icon={IconAwesomeEnum.CROSS}
            style={ButtonIconStyle.DARK}
            size={ButtonSize.LARGE}
            link={linkToCloseLogs}
          />
        </div>
      )}
    </div>
  )
}

export const Breadcrumb = React.memo(BreadcrumbMemo, (prevProps, nextProps) => {
  return equal(prevProps, nextProps)
})
