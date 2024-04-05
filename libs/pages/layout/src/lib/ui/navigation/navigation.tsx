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
import { ButtonIcon, ButtonIconStyle, ButtonLegacySize, IconAwesomeEnum, Tooltip } from '@qovery/shared/ui'
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

      <div className="flex flex-col justify-between px-2.5 py-5 flex-grow">
        <div className="flex flex-col gap-3">
          <Tooltip content="Environments" side="right">
            <div>
              <ButtonIcon
                className={matchOrganizationRoute ? 'is-active' : ''}
                icon={IconAwesomeEnum.LAYER_GROUP}
                style={ButtonIconStyle.ALT}
                size={ButtonLegacySize.XLARGE}
                link={projectId ? OVERVIEW_URL(organizationId, projectId) : ORGANIZATION_URL(organizationId)}
              />
            </div>
          </Tooltip>
          <Tooltip content="Clusters" side="right">
            <div>
              <ButtonIcon
                className={matchClusterRoute ? 'is-active' : ''}
                icon={IconAwesomeEnum.CLOUD_WORD}
                style={ButtonIconStyle.ALT}
                size={ButtonLegacySize.XLARGE}
                link={CLUSTERS_URL(organizationId)}
                notification={clusterNotification}
              />
            </div>
          </Tooltip>
          <Tooltip content="Audit Logs" side="right">
            <div>
              <ButtonIcon
                className={matchEventsRoute ? 'is-active' : ''}
                icon={IconAwesomeEnum.CLOCK_ROTATE_LEFT}
                style={ButtonIconStyle.ALT}
                size={ButtonLegacySize.XLARGE}
                link={AUDIT_LOGS_URL(organizationId)}
              />
            </div>
          </Tooltip>
        </div>
        <div>
          <div className="flex flex-col gap-3">
            <Tooltip content="Settings" side="right">
              <div>
                <ButtonIcon
                  className={matchSettingsRoute ? 'is-active' : ''}
                  icon={IconAwesomeEnum.WHEEL}
                  style={ButtonIconStyle.ALT}
                  size={ButtonLegacySize.XLARGE}
                  link={SETTINGS_URL(organizationId)}
                />
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
