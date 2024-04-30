import clsx from 'clsx'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  AUDIT_LOGS_URL,
  CLUSTERS_URL,
  CLUSTER_URL,
  INFRA_LOGS_URL,
  ORGANIZATION_AUDIT_LOGS_URL,
  ORGANIZATION_PROJECT_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  SETTINGS_URL,
} from '@qovery/shared/routes'
import { Icon, Link as LinkButton, Tooltip } from '@qovery/shared/ui'
import MenuAccountFeature from '../../feature/menu-account-feature/menu-account-feature'

export interface NavigationProps {
  defaultOrganizationId: string
  clusterNotification: boolean
}

export function Navigation({ defaultOrganizationId, clusterNotification }: NavigationProps) {
  const { organizationId = defaultOrganizationId, clusterId = '', projectId } = useParams()
  const { pathname } = useLocation()

  const matchLogInfraRoute = pathname.includes(INFRA_LOGS_URL(organizationId, clusterId))
  const matchOrganizationRoute = pathname.includes(ORGANIZATION_URL(organizationId) + ORGANIZATION_PROJECT_URL)
  const matchEventsRoute = pathname.includes(ORGANIZATION_URL(organizationId) + ORGANIZATION_AUDIT_LOGS_URL)
  const matchSettingsRoute = pathname.includes(`${SETTINGS_URL(organizationId)}`)
  const matchClusterRoute =
    pathname.includes(CLUSTERS_URL(organizationId)) ||
    matchLogInfraRoute ||
    pathname.includes(CLUSTER_URL(organizationId, clusterId))

  return (
    <div className="w-16 h-screen dark:bg-neutral-650 bg-white flex flex-col">
      <Link
        to={matchLogInfraRoute ? INFRA_LOGS_URL(organizationId, clusterId) : ORGANIZATION_URL(organizationId)}
        className="flex w-16 h-16 items-center justify-center border-b z-10 dark:border-neutral-500 border-neutral-200"
      >
        <img className="w-[28px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
      </Link>

      <div className="flex flex-col justify-between px-2.5 py-4 flex-grow">
        <div className="flex flex-col gap-2">
          <Tooltip content="Environments" side="right">
            <div>
              <LinkButton
                as="button"
                color="neutral"
                variant="plain"
                className={clsx(
                  'w-11 h-11 justify-center hover:!bg-neutral-100 hover:!text-brand-500 hover:!border-transparent',
                  {
                    'bg-neutral-100 text-brand-500': matchOrganizationRoute,
                  }
                )}
                to={projectId ? OVERVIEW_URL(organizationId, projectId) : ORGANIZATION_URL(organizationId)}
              >
                <Icon iconName="layer-group" className="text-[18px]" />
              </LinkButton>
            </div>
          </Tooltip>
          <Tooltip content="Clusters" side="right">
            <div className="relative">
              <LinkButton
                as="button"
                color="neutral"
                variant="plain"
                className={clsx(
                  'w-11 h-11 justify-center hover:!bg-neutral-100 hover:!text-brand-500 hover:!border-transparent',
                  {
                    'bg-neutral-100 text-brand-500': matchClusterRoute,
                  }
                )}
                to={CLUSTERS_URL(organizationId)}
              >
                <Icon iconName="cloud-word" className="text-[18px]" />
              </LinkButton>
              {clusterNotification && (
                <span className="w-2 h-2 rounded-lg bg-red-500 absolute top-1.5 right-1.5"></span>
              )}
            </div>
          </Tooltip>
          <Tooltip content="Audit Logs" side="right">
            <div>
              <LinkButton
                as="button"
                color="neutral"
                variant="plain"
                className={clsx(
                  'w-11 h-11 justify-center hover:!bg-neutral-100 hover:!text-brand-500 hover:!border-transparent',
                  {
                    'bg-neutral-100 text-brand-500': matchEventsRoute,
                  }
                )}
                to={AUDIT_LOGS_URL(organizationId)}
              >
                <Icon iconName="clock-rotate-left" className="text-[18px]" />
              </LinkButton>
            </div>
          </Tooltip>
        </div>
        <div>
          <div className="flex flex-col gap-3">
            <Tooltip content="Settings" side="right">
              <div>
                <LinkButton
                  as="button"
                  color="neutral"
                  variant="plain"
                  className={clsx(
                    'w-11 h-11 justify-center hover:!bg-neutral-100 hover:!text-brand-500 hover:!border-transparent',
                    {
                      'bg-neutral-100 text-brand-500': matchSettingsRoute,
                    }
                  )}
                  to={SETTINGS_URL(organizationId)}
                >
                  <Icon iconName="gear" className="text-[18px]" />
                </LinkButton>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex w-16 h-16 mb-5 items-center justify-center border-t dark:border-neutral-500 border-neutral-200">
        <MenuAccountFeature />
      </div>
    </div>
  )
}

export default Navigation
