import { Link, useLocation, useParams } from 'react-router-dom'
import { CLUSTERS_URL, INFRA_LOGS_URL, ORGANIZATION_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  Icon,
  IconAwesomeEnum,
  Menu,
  MenuAlign,
  MenuDirection,
  Tooltip,
} from '@qovery/shared/ui'
import MenuAccountFeature from '../../feature/menu-account-feature/menu-account-feature'

export function Navigation() {
  const { organizationId = '', clusterId = '' } = useParams()
  const { pathname } = useLocation()

  const matchLogInfraRoute = pathname.includes(INFRA_LOGS_URL(organizationId, clusterId))
  const matchOrganizationRoute = pathname.includes(`${ORGANIZATION_URL(organizationId)}/project`)
  const matchSettingsRoute = pathname.includes(`${SETTINGS_URL(organizationId)}`)
  const matchClusterRoute = pathname.includes(CLUSTERS_URL(organizationId)) || matchLogInfraRoute

  const infosMenu = [
    {
      title: 'Need help?',
      items: [
        {
          name: 'See documentations',
          link: {
            url: 'https://hub.qovery.com/',
            external: true,
          },
          contentLeft: <Icon name="icon-solid-book" className="text-sm text-brand-400" />,
        },
        {
          name: 'Community Forum',
          link: {
            url: 'https://discuss.qovery.com/',
            external: true,
          },
          contentLeft: <Icon name={IconAwesomeEnum.PEOPLE} className="text-sm text-brand-400" />,
        },
        {
          name: 'Roadmap',
          link: {
            url: 'https://roadmap.qovery.com/b/5m13y5v6/feature-ideas',
            external: true,
          },
          contentLeft: <Icon name={IconAwesomeEnum.ROAD} className="text-sm text-brand-400" />,
        },
        {
          name: 'Contact us',
          link: {
            url: 'https://discord.qovery.com/',
            external: true,
          },
          contentLeft: <Icon name="icon-solid-envelope" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  return (
    <div className="w-16 h-screen dark:bg-element-light-darker-400 bg-white flex flex-col">
      <Link
        to={matchLogInfraRoute ? INFRA_LOGS_URL(organizationId, clusterId) : ORGANIZATION_URL(organizationId)}
        className="flex w-16 h-16 items-center justify-center border-b z-10 dark:border-element-light-darker-100 border-element-light-lighter-400"
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
                size={ButtonSize.XLARGE}
                link={ORGANIZATION_URL(organizationId)}
              />
            </div>
          </Tooltip>
          <Tooltip content="Clusters" side="right">
            <div>
              <ButtonIcon
                className={matchClusterRoute ? 'is-active' : ''}
                icon={IconAwesomeEnum.CLOUD_WORD}
                style={ButtonIconStyle.ALT}
                size={ButtonSize.XLARGE}
                link={CLUSTERS_URL(organizationId)}
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
                  size={ButtonSize.XLARGE}
                  link={SETTINGS_URL(organizationId)}
                />
              </div>
            </Tooltip>
            <Tooltip content="Helps" side="right">
              <div>
                <Menu
                  trigger={
                    <ButtonIcon
                      icon={IconAwesomeEnum.CIRCLE_INFO}
                      style={ButtonIconStyle.ALT}
                      size={ButtonSize.XLARGE}
                    />
                  }
                  direction={MenuDirection.RIGHT}
                  arrowAlign={MenuAlign.END}
                  menus={infosMenu}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex w-16 h-16 mb-5 items-center justify-center border-t dark:border-element-light-darker-100 border-element-light-lighter-400">
        <MenuAccountFeature />
      </div>
    </div>
  )
}

export default Navigation
