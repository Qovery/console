import equal from 'fast-deep-equal'
import { Application, Database, Environment, Organization, Project } from 'qovery-typescript-axios'
import React from 'react'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import { ApplicationEntity, ClusterEntity, DatabaseEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_GENERAL_URL,
  APPLICATION_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  INFRA_LOGS_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import Icon from '../../icon/icon'
import { MenuItemProps } from '../../menu/menu-item/menu-item'
import StatusChip from '../../status-chip/status-chip'
import BreadcrumbItem from '../breadcrumb-item/breadcrumb-item'

export interface BreadcrumbProps {
  organizations: Organization[]
  clusters?: ClusterEntity[]
  projects?: Project[]
  environments?: Environment[]
  applications?: Application[]
  databases?: Database[]
}

export function BreadcrumbMemo(props: BreadcrumbProps) {
  const { organizations, clusters, projects, environments, applications, databases } = props
  const { organizationId, projectId, environmentId, applicationId, databaseId, clusterId } = useParams()
  const { pathname } = useLocation()

  const currentOrganization = organizations?.find((organization) => organizationId === organization.id)
  const matchLogInfraRoute = matchPath(location.pathname || '', INFRA_LOGS_URL(organizationId, clusterId))

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

  // const clustersMenu = [
  //   {
  //     title: 'Clusters',
  //     search: true,
  //     items: clusters
  //       ? clusters?.map((cluster: ClusterEntity) => ({
  //           name: cluster.name,
  //           link: {
  //             url: INFRA_LOGS_URL(cluster.id),
  //           },
  //           contentLeft: (
  //             <Icon
  //               name="icon-solid-check"
  //               className={`text-sm ${clusterId === cluster.id ? 'text-success-400' : 'text-transparent'}`}
  //             />
  //           ),
  //           contentRight: (
  //             <>{cluster.cloud_provider && <Icon data-testid="icon" name={`${cluster.cloud_provider}_GRAY`} />}</>
  //           ),
  //         }))
  //       : [],
  //   },
  // ]

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
      className={`w-4 h-4.5 flex items-center justify-center text-xs text-text-400 text-center bg-element-light-lighter-400 rounded-sm font-bold ${margin}`}
    >
      {text}
    </div>
  )

  if (organizations?.length === 0) return <div />

  return (
    <div className="flex h-full items-center">
      {organizationId && (
        <BreadcrumbItem
          isLast={!projectId}
          label="Organization"
          data={organizations}
          menuItems={matchLogInfraRoute ? [] : organizationsMenu}
          paramId={organizationId}
          link={ORGANIZATION_URL(organizationId)}
          logo={
            currentOrganization?.logo_url ? (
              <img
                src={currentOrganization?.logo_url}
                className="h-4"
                alt={`${currentOrganization?.name} organization`}
              />
            ) : (
              squareContent(currentOrganization?.name.charAt(0), '')
            )
          }
        />
      )}
      {clusterId && (
        <>
          <div className="w-4 h-auto text-element-light-lighter-600 text-center mx-3">/</div>
          <BreadcrumbItem
            isDark
            isLast={!projectId}
            label="Cluster"
            data={clusters}
            menuItems={[]}
            paramId={clusterId}
            link={INFRA_LOGS_URL(organizationId, clusterId)}
          />
        </>
      )}
      {projectId && (
        <>
          <div className="w-4 h-auto text-element-light-lighter-600 text-center mx-3">/</div>
          <BreadcrumbItem
            isLast={!environmentId}
            label="Project"
            data={projects}
            menuItems={projectMenu}
            paramId={projectId}
            link={`${ENVIRONMENTS_URL(organizationId, projectId)}${ENVIRONMENTS_GENERAL_URL}`}
            // link={OVERVIEW_URL(organizationId, projectId)}
          />
        </>
      )}
      {environmentId && (
        <>
          <div className="w-4 h-auto text-element-light-lighter-600 text-center mx-3">/</div>
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
                    <div className="w-4 h-auto text-element-light-lighter-600 text-center mx-3">/</div>
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
                            : DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL
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
    </div>
  )
}

export const Breadcrumb = React.memo(BreadcrumbMemo, (prevProps, nextProps) => {
  return equal(prevProps, nextProps)
})
