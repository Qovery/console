import { Link, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router'
import { IconEnum } from '@console/shared/enums'
import { SETTINGS_URL } from '@console/shared/router'
import { Avatar } from '../../avatar/avatar'
import { ButtonIcon, ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import { ButtonSize } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import Menu, { MenuAlign, MenuDirection } from '../../menu/menu'
import Modal from '../../modal/modal'
import ModalUser from '../../modals/modal-user/modal-user'

export interface NavigationProps {
  authLogout: () => void
  firstName: string
  lastName: string
  darkMode?: boolean
}

export function Navigation(props: NavigationProps) {
  const { firstName, lastName, darkMode } = props
  const { organizationId } = useParams()
  const navigate = useNavigate()

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
          name: 'Join Discord',
          link: {
            url: 'https://discord.com/invite/Bed5FRa',
            external: true,
          },
          contentLeft: <Icon name="icon-brands-discord" className="text-sm text-brand-400" />,
        },
        {
          name: 'Contact us',
          link: {
            url: 'https://discord.qovery.com/',
            external: true,
          },
          contentLeft: <Icon name="icon-solid-envelope" className="text-sm text-brand-400" />,
        },
        {
          name: 'Shortcuts',
          link: {
            url: 'https://discord.qovery.com/',
          },
          contentLeft: <Icon name="icon-solid-keyboard" className="text-sm text-brand-400" />,
        },
      ],
    },
  ]

  return (
    <div className={`w-16 h-full fixed top-0 left-0 z-10 ${darkMode ? 'bg-element-light-darker-400' : 'bg-white'}`}>
      <Link
        to={'/'}
        className={`flex w-16 h-16 items-center justify-center border-b z-10 ${
          darkMode ? 'border-element-light-darker-100' : 'border-element-light-lighter-400'
        }`}
      >
        <img className="w-[28px]" src="/assets/logos/logo-icon.svg" alt="Qovery logo" />
      </Link>

      <div className="flex flex-col justify-between h-[calc(100%-8rem)] px-2.5 py-5">
        <div className="flex flex-col gap-3">
          <ButtonIcon icon="icon-solid-gauge-high" style={ButtonIconStyle.ALT} size={ButtonSize.XLARGE} active={true} />
          <ButtonIcon icon="icon-solid-layer-group" style={ButtonIconStyle.ALT} size={ButtonSize.XLARGE} />
          <ButtonIcon icon="icon-solid-clock-rotate-left" style={ButtonIconStyle.ALT} size={ButtonSize.XLARGE} />
        </div>
        <div>
          <div className="flex flex-col gap-3">
            <ButtonIcon
              icon="icon-solid-wheel"
              style={ButtonIconStyle.ALT}
              size={ButtonSize.XLARGE}
              onClick={() => navigate(SETTINGS_URL(organizationId))}
            />
            <Menu
              trigger={
                <ButtonIcon icon="icon-solid-circle-info" style={ButtonIconStyle.ALT} size={ButtonSize.XLARGE} />
              }
              direction={MenuDirection.RIGHT}
              arrowAlign={MenuAlign.END}
              menus={infosMenu}
            />
          </div>
        </div>
      </div>

      <div
        className={`flex w-16 h-16 mb-2 items-center justify-center border-t ${
          darkMode ? 'border-element-light-darker-100' : 'border-element-light-lighter-400'
        }`}
      >
        <Modal
          buttonClose={false}
          trigger={
            <div className="cursor-pointer">
              <Avatar firstName={firstName} lastName={lastName} icon={IconEnum.GITLAB} />
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
