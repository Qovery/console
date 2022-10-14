import { InviteMemberRoleEnum, Member, OrganizationAvailableRole } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/router'
import { Avatar, Icon, IconAwesomeEnum, Menu, MenuData } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface RowMemberProps {
  member: Member
  availableRoles: OrganizationAvailableRole[]
  editMemberRole: (userId: string, roleId: string) => void
  loading: boolean
}

export function RowMember(props: RowMemberProps) {
  const { member, availableRoles, editMemberRole, loading } = props

  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const name = member.name?.split(' ')

  const menus: MenuData = [
    {
      items: availableRoles.map((role) => ({
        name: upperCaseFirstLetter(role.name) || '',
        contentLeft: <Icon name={IconAwesomeEnum.USER} className="text-brand-500" />,
        onClick: () => editMemberRole(member.id, role.id || ''),
      })),
    },
    {
      items: [
        {
          name: 'Create new role',
          onClick: () => navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_URL}`),
          contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_PLUS} className="text-brand-500" />,
        },
      ],
    },
  ]

  const input = (role?: InviteMemberRoleEnum | string) => (
    <div
      className={`flex relative px-3 py-2 border rounded select-none w-44 ${
        role === InviteMemberRoleEnum.OWNER.toLocaleLowerCase()
          ? 'bg-element-light-lighter-200 border-element-light-ligther-500 text-text-400'
          : 'border-element-light-ligther-600 text-text-600 cursor-pointer'
      }`}
    >
      <span className="text-sm">{upperCaseFirstLetter(role)}</span>
      {role !== InviteMemberRoleEnum.OWNER.toLocaleLowerCase() && (
        <Icon
          name={IconAwesomeEnum.ANGLE_DOWN}
          className="absolute top-2.5 right-4 text-sm text-text-500 leading-3 translate-y-0.5 pointer-events-none"
        />
      )}
    </div>
  )

  console.log(loading)

  return (
    <div className="grid grid-cols-4 border-b border-element-light-lighter-400 last:border-0">
      <div className="border-r border-element-light-lighter-400 h-full">
        <div className="flex items-center px-4 py-3">
          {name && (
            <Avatar className="shrink-0" firstName={name[0]} lastName={name[1]} url={member.profile_picture_url} />
          )}
          <div className="ml-3 text-xs">
            <p className="text-text-600 font-medium mb-1">{member.name}</p>
            <span className="text-text-500">{member.email}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center px-4">
        {member.role_name !== InviteMemberRoleEnum.OWNER.toLocaleLowerCase() ? (
          <Menu menus={menus} trigger={input(member.role_name)} />
        ) : (
          input(member.role_name)
        )}
      </div>
      <div className="flex items-center px-4 text-text-500 text-xs font-medium">{member.updated_at}</div>
      <div className="flex items-center px-4 text-text-500 text-xs font-medium">{member.created_at}</div>
    </div>
  )
}

export default RowMember
