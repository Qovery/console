import { Menu, MenuAlign, MenuSize } from '../../menu/menu'
import { ButtonIcon, ButtonIconSize, ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import Icon from '../../icon/icon'
import { useState } from 'react'

export function TopBar() {
  const [openProject, setOpenProject] = useState(false)

  const notificationsMenu = [
    {
      title: 'Steps to complete 28/35',
      button: 'See all',
      buttonLink: '/',
      items: [
        {
          name: 'Invite member to the team',
          link: '/overview',
          contentLeft: <Icon name="icon-solid-layer-group" className="text-sm text-brand-400" />,
        },
        {
          name: 'Add a custom domain',
          link: '/overview',
          contentLeft: <Icon name="icon-brands-discord" className="text-sm text-brand-400" />,
        },
        {
          name: 'Deploy your application',
          link: '/overview',
          contentLeft: <Icon name="icon-solid-envelope" className="text-sm text-brand-400" />,
        },
      ],
    },
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
      ],
    },
  ]

  const projectMenu = [
    {
      title: 'Project',
      search: true,
      button: 'Change organization',
      buttonLink: '/',
      items: [
        {
          name: 'TwitterClone',
          link: '/overview',
          contentLeft: <Icon name="icon-solid-check" className="text-sm text-success-400" />,
        },
        {
          name: 'Project 2',
          link: '/overview',
        },
        {
          name: 'Project 3',
          link: '/overview',
        },
        {
          name: 'Project 1',
          link: '/overview',
        },
      ],
    },
  ]

  return (
    <div className="fixed top-0 left-14 border-l border-element-light-lighter-400 z-10 bg-white w-[calc(100%-3.5rem)] h-14">
      <div className="flex px-5 justify-between items-center h-full">
        <div className="flex h-full gap-2 items-center cursor-pointer" onClick={() => setOpenProject(true)}>
          <Icon name="icon-solid-layer-group" className="text-accent2-300" />
          <p className="text-sm text-text-500 font-medium -mr-3">TwitterClone</p>
          <Menu
            menus={projectMenu}
            open={openProject}
            arrowAlign={MenuAlign.START}
            onClose={() => setOpenProject(false)}
            trigger={
              <ButtonIcon
                className="no-active"
                icon="icon-solid-angle-down"
                style={ButtonIconStyle.FLAT}
                size={ButtonIconSize.BIG}
              />
            }
          />
        </div>
        <div className="flex gap-3">
          <ButtonIcon
            icon="icon-solid-rocket"
            style={ButtonIconStyle.STROKED}
            size={ButtonIconSize.BIG}
            notification={true}
          />
          <Menu
            menus={notificationsMenu}
            arrowAlign={MenuAlign.END}
            size={MenuSize.BIG}
            trigger={
              <ButtonIcon
                icon="icon-solid-bell"
                style={ButtonIconStyle.STROKED}
                size={ButtonIconSize.BIG}
                notification={true}
              />
            }
          >
            <div className="p-5 border-b border-element-light-lighter-400">
              <h3 className="text-text-600 text-xl mb-2">
                Hi, Romaric
                <span role="img" aria-label="icon" className="ml-1">
                  👋
                </span>
              </h3>
              <p className="text-sm text-text-500 mb-3">Follow these steps to get started quickly</p>
              <div className="w-full h-[6px] rounded-sm bg-element-light-lighter-400 mb-2 overflow-hidden">
                <div className="w-[85%] h-full bg-brand-400"></div>
              </div>
              <p className="text-sm text-text-400">85% complete, almost there!</p>
            </div>
          </Menu>
          <ButtonIcon icon="icon-solid-magnifying-glass" style={ButtonIconStyle.STROKED} size={ButtonIconSize.BIG} />
        </div>
      </div>
    </div>
  )
}

export default TopBar
