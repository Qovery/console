import { SignUp } from 'qovery-typescript-axios'
import { useNavigate } from 'react-router-dom'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { LOGOUT_URL, ORGANIZATION_URL } from '@qovery/shared/router'
import { Avatar, Icon, IconAwesomeEnum, Menu, MenuAlign, MenuDirection } from '@qovery/shared/ui'

export interface MenuAccountProps {
  organizations: OrganizationEntity[]
  currentOrganization: OrganizationEntity
  user: SignUp
}

export function MenuAccount(props: MenuAccountProps) {
  const { user, organizations, currentOrganization } = props
  const navigate = useNavigate()

  const blockOrganization = (organization: OrganizationEntity) => (
    <div className="flex items-center">
      <Icon
        name={IconAwesomeEnum.CHECK}
        className={`mr-4 ${currentOrganization.id === organization.id ? 'text-success-500' : 'opacity-0'}`}
      />
      <span className="w-8 h-8 p-1 rounded-sm flex items-center justify-center mr-3">
        {organization.logo_url ? (
          <img src={organization.logo_url} alt="" />
        ) : (
          <span className="w-full h-full font-medium text-xxs text-text-400 bg-element-light-lighter-200 flex items-center justify-center uppercase">
            {organization.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="text-text-700 text-sm font-medium">{organization.name}</span>
    </div>
  )

  const menus = [
    {
      title: 'Organizations',
      items: organizations.map((organization: OrganizationEntity) => ({
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
                  firstName={user?.first_name || ''}
                  lastName={user?.last_name}
                  noTooltip
                />
                <div>
                  <p className="text-text-700 text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <span className="text-text-400 text-xs">{user.user_email}</span>
                </div>
              </div>
              <Icon name={IconAwesomeEnum.WHEEL} className="text-brand-500 link" />
            </div>
          ),
          containerClassName: '!h-14',
          onClick: () =>
            window.location.replace('https://console.qovery.com/platform/organization/user/settings/general'),
        },
      ],
    },
    {
      items: [
        {
          itemContentCustom: (
            <div className="text-text-500 text-ssm font-medium">
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
        <div className="cursor-pointer">
          <Avatar
            size={40}
            firstName={user?.first_name || ''}
            lastName={user?.last_name}
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
