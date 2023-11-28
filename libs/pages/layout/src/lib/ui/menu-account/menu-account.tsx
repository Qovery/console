import { type Organization } from 'qovery-typescript-axios'
import { useNavigate } from 'react-router-dom'
import { LOGOUT_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL, ORGANIZATION_URL, USER_URL } from '@qovery/shared/routes'
import { Avatar, Icon, IconAwesomeEnum, Menu, MenuAlign, type MenuData, MenuDirection } from '@qovery/shared/ui'

export interface MenuAccountProps {
  organizations: Organization[]
  currentOrganization?: Organization
  user: {
    firstName?: string
    lastName?: string
    email?: string
    picture?: string
  }
}

export function MenuAccount(props: MenuAccountProps) {
  const { user, organizations, currentOrganization } = props
  const navigate = useNavigate()

  const blockOrganization = (organization: Organization) => (
    <div data-testid={`content-${organization.id}`} className="flex items-center">
      <Icon
        name={IconAwesomeEnum.CHECK}
        className={`mr-4 ${currentOrganization?.id === organization.id ? 'text-green-500' : 'opacity-0'}`}
      />
      <span className="w-8 h-8 rounded-sm flex items-center justify-center mr-3">
        {organization.logo_url ? (
          <img className="p-1" src={organization.logo_url} alt="Organization logo" />
        ) : (
          <span className="w-full h-full font-medium text-xs text-neutral-350 bg-neutral-200 flex items-center justify-center uppercase rounded">
            {organization.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="text-neutral-400 dark:text-neutral-100 text-sm font-medium">{organization.name}</span>
    </div>
  )

  const menus: MenuData = [
    {
      title: 'Organizations',
      sortAlphabetically: true,
      button: {
        label: <Icon name={IconAwesomeEnum.CIRCLE_PLUS} className="text-brand-500 link !text-base mr-3" />,
        onClick: () => navigate(ONBOARDING_URL + ONBOARDING_PROJECT_URL),
      },
      items: organizations.map((organization: Organization) => ({
        name: organization.name,
        itemContentCustom: blockOrganization(organization),
        containerClassName: '!h-14',
        onClick: () => navigate(ORGANIZATION_URL(organization.id)),
      })),
    },
    {
      items: [
        {
          itemContentCustom: (
            <div className="w-full flex items-center justify-between">
              <div className="flex">
                <Avatar
                  className="mr-3"
                  size={40}
                  url={user?.picture}
                  firstName={user?.firstName || ''}
                  lastName={user?.lastName}
                  noTooltip
                />
                <div>
                  <p className="text-neutral-400 dark:text-neutral-100 text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className="text-neutral-350 text-xs">{user.email}</span>
                </div>
              </div>
            </div>
          ),
          containerClassName: '!h-14',
          onClick: () => navigate(USER_URL),
        },
      ],
    },
    {
      items: [
        {
          itemContentCustom: (
            <div className="text-neutral-400 dark:text-neutral-100 text-ssm font-medium">
              <Icon name={IconAwesomeEnum.ARROW_RIGHT_FROM_BRACKET} className="text-brand-500 mr-3" />
              Logout
            </div>
          ),
          onClick: () => navigate(LOGOUT_URL),
        },
      ],
    },
  ]
  return (
    <Menu
      trigger={
        <div className="cursor-pointer select-none" data-testid="btn-menu-account">
          <Avatar
            size={40}
            firstName={user?.firstName || ''}
            lastName={user?.lastName}
            url={user?.picture}
            logoUrl={currentOrganization?.logo_url || undefined}
            logoText={!currentOrganization?.logo_url ? currentOrganization?.name.charAt(0) : undefined}
            noTooltip
          />
        </div>
      }
      direction={MenuDirection.RIGHT}
      arrowAlign={MenuAlign.END}
      menus={menus}
    />
  )
}

export default MenuAccount
