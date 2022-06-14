import { Application, Database, Environment, Organization, Project } from 'qovery-typescript-axios'
import { Menu, MenuAlign } from '../../menu/menu'
import { ButtonIcon, ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import Icon from '../../icon/icon'
import { Breadcrumb } from '../breadcrumb/breadcrumb'

const notificationsMenu = [
  {
    title: 'Steps to complete 28/35',
    button: 'See all',
    buttonLink: '/',
    items: [
      {
        name: 'Invite member to the team',
        link: {
          url: '/overview',
        },
        contentLeft: <Icon name="icon-solid-arrow-right" className="text-sm text-brand-400" />,
      },
      {
        name: 'Add a custom domain',
        link: {
          url: '/overview',
        },
        contentLeft: <Icon name="icon-solid-globe" className="text-sm text-brand-400" />,
      },
      {
        name: 'Deploy your application',
        link: {
          url: '/overview',
        },
        contentLeft: <Icon name="icon-solid-cloud" className="text-sm text-brand-400" />,
      },
    ],
  },
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
    ],
  },
]
export interface TopBarProps {
  organizations: Organization[]
  projects?: Project[]
  environments?: Environment[]
  applications?: Application[]
  databases?: Database[]
  darkMode?: boolean
}

export function TopBar(props: TopBarProps) {
  const { organizations, projects, environments, applications, databases, darkMode } = props

  return (
    <div
      className={`fixed top-0 left-16 border-l border-b w-[calc(100%-3.5rem)] h-14 ${
        darkMode
          ? 'border-element-light-darker-100 bg-element-light-darker-400 border-b-0'
          : 'border-element-light-lighter-400 z-10 bg-white'
      }`}
    >
      <div className="flex px-5 justify-between items-center h-full">
        <Breadcrumb
          organizations={organizations}
          projects={projects}
          environments={environments}
          applications={applications}
          databases={databases}
        />
        {/* @TODO fix me should be dynamic */}
        {!darkMode && (
          <div className="flex gap-3">
            <ButtonIcon icon="icon-solid-rocket" style={ButtonIconStyle.STROKED} notification={true} />
            <Menu
              menus={notificationsMenu}
              arrowAlign={MenuAlign.END}
              width={374}
              paddingMenuX={20}
              paddingMenuY={16}
              trigger={
                <ButtonIcon
                  icon="icon-solid-bell"
                  style={ButtonIconStyle.STROKED}
                  notification={true}
                  onClick={(e) => e.preventDefault}
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
            <ButtonIcon icon="icon-solid-magnifying-glass" style={ButtonIconStyle.STROKED} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TopBar
