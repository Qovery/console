import { Link, matchPath, useLocation, useParams } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import { CLUSTER_URL, INFRA_LOGS_URL, ORGANIZATION_URL, SETTINGS_URL } from '@qovery/shared/router'
import {
  Avatar,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  Icon,
  IconAwesomeEnum,
  Menu,
  MenuAlign,
  MenuDirection,
  Modal,
  ModalUser,
} from '@qovery/shared/ui'

export interface NavigationProps {
  firstName: string
  lastName: string
}

export function Navigation(props: NavigationProps) {
  const { firstName, lastName } = props
  const { organizationId = '', clusterId = '' } = useParams()
  const { pathname } = useLocation()

  const matchLogInfraRoute = matchPath(pathname, INFRA_LOGS_URL(organizationId, clusterId))
  const matchOrganizationRoute = pathname.includes(`${ORGANIZATION_URL(organizationId)}/project`)
  const matchSettingsRoute = pathname.includes(`${SETTINGS_URL(organizationId)}`)
  const matchClusterRoute = pathname.includes(CLUSTER_URL(organizationId))

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
          <ButtonIcon
            className={matchOrganizationRoute ? 'is-active' : ''}
            icon={IconAwesomeEnum.LAYER_GROUP}
            style={ButtonIconStyle.ALT}
            size={ButtonSize.XLARGE}
            link={ORGANIZATION_URL(organizationId)}
          />
          <ButtonIcon
            className={matchClusterRoute ? 'is-active' : ''}
            icon={IconAwesomeEnum.CLOUD_WORD}
            style={ButtonIconStyle.ALT}
            size={ButtonSize.XLARGE}
            link={CLUSTER_URL(organizationId)}
          />
        </div>
        <div>
          <div className="flex flex-col gap-3">
            <ButtonIcon
              className={matchSettingsRoute ? 'is-active' : ''}
              icon={IconAwesomeEnum.WHEEL}
              style={ButtonIconStyle.ALT}
              size={ButtonSize.XLARGE}
              link={SETTINGS_URL(organizationId)}
            />
            <Menu
              trigger={
                <ButtonIcon icon={IconAwesomeEnum.CIRCLE_INFO} style={ButtonIconStyle.ALT} size={ButtonSize.XLARGE} />
              }
              direction={MenuDirection.RIGHT}
              arrowAlign={MenuAlign.END}
              menus={infosMenu}
            />
          </div>
        </div>
      </div>

      <div className="flex w-16 h-16 mb-2 items-center justify-center border-t dark:border-element-light-darker-100 border-element-light-lighter-400">
        <Modal
          buttonClose={false}
          trigger={
            <div className="cursor-pointer">
              <Avatar firstName={firstName} lastName={lastName} icon={IconEnum.GITLAB} noTooltip />
            </div>
          }
        >
          <ModalUser firstName={firstName} lastName={lastName} />
        </Modal>
      </div>
    </div>
  )
}

export default Navigation
