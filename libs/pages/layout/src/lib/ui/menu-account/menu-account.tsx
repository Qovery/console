import { type Organization } from 'qovery-typescript-axios'
import { useNavigate } from 'react-router-dom'
import { LOGOUT_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL, ORGANIZATION_URL, USER_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum, LegacyAvatar, Menu, MenuAlign, type MenuData, MenuDirection } from '@qovery/shared/ui'

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
      <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-sm">
        {organization.logo_url ? (
          <img className="p-1" src={organization.logo_url} alt="Organization logo" />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded bg-neutral-200 text-xs font-medium uppercase text-neutral-350">
            {organization.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="text-sm font-medium text-neutral-400 dark:text-neutral-100">{organization.name}</span>
    </div>
  )

  const menus: MenuData = [
    {
      title: 'Organizations',
      sortAlphabetically: true,
      button: {
        label: <Icon iconName="circle-plus" iconStyle="regular" className="link mr-3 !text-base text-brand-500" />,
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
            <div className="flex w-full items-center justify-between">
              <div className="flex">
                <LegacyAvatar
                  className="mr-3"
                  size={40}
                  url={user?.picture}
                  firstName={user?.firstName || ''}
                  lastName={user?.lastName}
                  noTooltip
                />
                <div>
                  <p className="text-sm font-medium text-neutral-400 dark:text-neutral-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className="text-xs text-neutral-350">{user.email}</span>
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
            <div className="text-ssm font-medium text-neutral-400 dark:text-neutral-100">
              <Icon iconName="arrow-right-from-bracket" className="mr-3 text-brand-500" />
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
          <LegacyAvatar
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
