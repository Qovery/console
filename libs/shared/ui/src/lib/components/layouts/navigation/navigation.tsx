import { IconEnum } from '@console/shared/enums'
import { Link } from 'react-router-dom'
import { Avatar } from '../../avatar/avatar'
import { ButtonIcon, ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import Icon from '../../icon/icon'
import Menu, { MenuAlign, MenuDirection } from '../../menu/menu'

export interface NavigationProps {
  authLogout: () => void
  firstName: string
  lastName: string
}

export function Navigation(props: NavigationProps) {
  const { authLogout, firstName, lastName } = props
export function Navigation() {
  const settingsMenu = [
    {
      title: 'Need help ?',
      items: [
        {
          name: 'See documentations',
          link: '/overview',
          contentLeft: <Icon name="icon-solid-layer-group" className="text-sm text-brand-400" />,
        },
        {
          name: 'Join Discord',
          link: '/overview',
          contentLeft: <Icon name="icon-brands-discord" className="text-sm text-brand-400" />,
        },
        {
          name: 'Contact us',
          link: '/overview',
          contentLeft: <Icon name="icon-solid-envelope" className="text-sm text-brand-400" />,
        },
        {
          name: 'Shortcuts',
          link: '/overview',
          contentLeft: <Icon name="icon-solid-keyboard" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  return (
    <div className="bg-white w-14 h-full fixed top-0 left-0 z-10">
      <Link
        to={'/'}
        className="flex w-14 h-14 items-center justify-center border-b border-element-light-lighter-400 z-10"
      >
        <img className="w-[28px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
      </Link>

      <div className="flex flex-col justify-between h-[calc(100%-7rem)] px-3 py-5">
        <div className="flex flex-col gap-3">
          <ButtonIcon icon="icon-solid-gauge-high" style={ButtonIconStyle.ALT} active={true} />
          <ButtonIcon icon="icon-solid-layer-group" style={ButtonIconStyle.ALT} />
          <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.ALT} />
        </div>
        <div>
          <div className="flex flex-col gap-3">
            <Menu
              trigger={<ButtonIcon icon="icon-solid-wheel" style={ButtonIconStyle.ALT} />}
              direction={MenuDirection.RIGHT}
              arrowAlign={MenuAlign.END}
              menus={settingsMenu}
            />
            <ButtonIcon icon="icon-solid-circle-info" style={ButtonIconStyle.ALT} />
          </div>
        </div>
      </div>

      <div className="flex w-14 h-14 items-center justify-center border-t border-element-light-lighter-400">
        <Avatar firstName={firstName} lastName={lastName} icon={IconEnum.GITLAB} onClick={authLogout}></Avatar>
      </div>
    </div>
  )
}

export default Navigation
