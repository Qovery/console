import clsx from 'clsx'
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom'
import {
  AUDIT_LOGS_URL,
  CLUSTERS_URL,
  CLUSTER_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  INFRA_LOGS_URL,
  ORGANIZATION_AUDIT_LOGS_URL,
  ORGANIZATION_PROJECT_URL,
  ORGANIZATION_URL,
  SETTINGS_URL,
} from '@qovery/shared/routes'
import { Icon, Link, Tooltip } from '@qovery/shared/ui'
import MenuAccountFeature from '../../feature/menu-account-feature/menu-account-feature'

export interface NavigationProps {
  defaultOrganizationId: string
  clusterNotification?: 'error' | 'warning'
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
    <div className="flex h-screen w-16 flex-col bg-white dark:bg-neutral-600">
      <RouterLink
        to={matchLogInfraRoute ? INFRA_LOGS_URL(organizationId, clusterId) : ORGANIZATION_URL(organizationId)}
        className="z-10 flex h-16 w-16 items-center justify-center border-b border-neutral-200 dark:border-neutral-500"
      >
        <img className="w-[28px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
      </RouterLink>

      <div className="flex flex-grow flex-col justify-between px-2.5 py-4">
        <div className="flex flex-col gap-2">
          <Tooltip content="Environments" side="right">
            <div>
              <Link
                as="button"
                color="neutral"
                variant="plain"
                className={clsx(
                  'h-11 w-11 justify-center hover:!border-transparent hover:!bg-neutral-100 hover:!text-brand-500 dark:hover:!bg-brand-500 dark:hover:!text-neutral-100',
                  {
                    'bg-neutral-100 text-brand-500 dark:bg-brand-500 dark:text-neutral-100': matchOrganizationRoute,
                  }
                )}
                to={
                  projectId
                    ? ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL
                    : ORGANIZATION_URL(organizationId)
                }
              >
                <Icon iconName="layer-group" className="text-[18px]" />
              </Link>
            </div>
          </Tooltip>
          <Tooltip content="Clusters" side="right">
            <div className="relative">
              <Link
                as="button"
                color="neutral"
                variant="plain"
                className={clsx(
                  'h-11 w-11 justify-center hover:!border-transparent hover:!bg-neutral-100 hover:!text-brand-500 dark:hover:!bg-brand-500 dark:hover:!text-neutral-100',
                  {
                    'bg-neutral-100 text-brand-500 dark:bg-brand-500 dark:text-neutral-100': matchClusterRoute,
                  }
                )}
                to={CLUSTERS_URL(organizationId)}
              >
                <Icon iconName="cloud-word" className="text-[18px]" />
              </Link>
              {clusterNotification === 'error' && (
                <span className="absolute right-1.5 top-1.5 flex">
                  <span className="absolute inline-flex h-full w-full animate-ping-small rounded-full bg-red-500 opacity-75" />
                  <span className="h-2 w-2 rounded-lg bg-red-500"></span>
                </span>
              )}
              {clusterNotification === 'warning' && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-lg bg-yellow-500"></span>
              )}
            </div>
          </Tooltip>
          <Tooltip content="Audit Logs" side="right">
            <div>
              <Link
                as="button"
                color="neutral"
                variant="plain"
                className={clsx(
                  'h-11 w-11 justify-center hover:!border-transparent hover:!bg-neutral-100 hover:!text-brand-500 dark:hover:!bg-brand-500 dark:hover:!text-neutral-100',
                  {
                    'bg-neutral-100 text-brand-500 dark:bg-brand-500 dark:text-neutral-100': matchEventsRoute,
                  }
                )}
                to={AUDIT_LOGS_URL(organizationId)}
              >
                <Icon iconName="clock-rotate-left" className="text-[18px]" />
              </Link>
            </div>
          </Tooltip>
        </div>
        <div>
          <div className="flex flex-col gap-3">
            <Tooltip content="Settings" side="right">
              <div>
                <Link
                  as="button"
                  color="neutral"
                  variant="plain"
                  className={clsx(
                    'h-11 w-11 justify-center hover:!border-transparent hover:!bg-neutral-100 hover:!text-brand-500 dark:hover:!bg-brand-500 dark:hover:!text-neutral-100',
                    {
                      'bg-neutral-100 text-brand-500 dark:bg-brand-500 dark:text-neutral-100': matchSettingsRoute,
                    }
                  )}
                  to={SETTINGS_URL(organizationId)}
                >
                  <Icon iconName="gear" className="text-[18px]" />
                </Link>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="mb-5 flex h-16 w-16 items-center justify-center border-t border-neutral-200 dark:border-neutral-500">
        <MenuAccountFeature />
      </div>
    </div>
  )
}

export default Navigation
