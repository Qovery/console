import { InviteMemberRoleEnum, Member, OrganizationAvailableRole } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/router'
import { Avatar, Icon, IconAwesomeEnum, LoaderSpinner, Menu, MenuData, Skeleton } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo, upperCaseFirstLetter } from '@qovery/shared/utils'

export interface RowMemberProps {
  member: Member
  editMemberRole: (userId: string, roleId: string) => void
  loading: boolean
  columnsWidth: string
  availableRoles?: OrganizationAvailableRole[]
  loadingUpdateRole?: boolean
}

export function RowMember(props: RowMemberProps) {
  const { member, availableRoles, editMemberRole, loading, columnsWidth, loadingUpdateRole } = props

  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const name = member.name?.split(' ')

  const menus: MenuData = [
    {
      items: availableRoles
        ? availableRoles.map((role) => ({
            name: upperCaseFirstLetter(role.name) || '',
            contentLeft: (
              <Icon
                name={
                  Object.values(InviteMemberRoleEnum).includes(role.name?.toUpperCase() as InviteMemberRoleEnum)
                    ? IconAwesomeEnum.USER_CROWN
                    : IconAwesomeEnum.USER
                }
                className="text-brand-500"
              />
            ),
            onClick: () => editMemberRole(member.id, role.id || ''),
          }))
        : [],
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
    <Skeleton className="shrink-0" show={loading} width={176} height={30}>
      <div
        data-testid="input"
        className={`flex relative px-3 py-2 border rounded select-none w-44 ${
          role === upperCaseFirstLetter(InviteMemberRoleEnum.OWNER)
            ? 'bg-element-light-lighter-200 border-element-light-ligther-500 text-text-400'
            : 'border-element-light-ligther-600 text-text-600 cursor-pointer'
        }`}
      >
        <span className="text-sm">{upperCaseFirstLetter(role)}</span>
        {!loadingUpdateRole && role !== upperCaseFirstLetter(InviteMemberRoleEnum.OWNER) && (
          <Icon
            name={IconAwesomeEnum.ANGLE_DOWN}
            className="absolute top-2.5 right-4 text-sm text-text-500 leading-3 translate-y-0.5 pointer-events-none"
          />
        )}
        {loadingUpdateRole && <LoaderSpinner className="w-4 h-4 absolute top-2.5 right-4" />}
      </div>
    </Skeleton>
  )

  return (
    <div
      className="grid grid-cols-4 border-b border-element-light-lighter-400 last:border-0"
      style={{ gridTemplateColumns: columnsWidth }}
    >
      <div className="border-r border-element-light-lighter-400 h-full">
        <div className="flex items-center px-4 py-3">
          {name && (
            <Skeleton className="shrink-0" show={loading} width={32} height={32} rounded>
              <Avatar firstName={name[0]} lastName={name[1]} url={member.profile_picture_url} />
            </Skeleton>
          )}
          <div className="ml-3 text-xs truncate">
            <Skeleton className="mb-1" show={loading} width={120} height={16}>
              <p className="text-text-600 font-medium truncate">{member.name}</p>
            </Skeleton>
            <Skeleton show={loading} width={100} height={16}>
              <span className="text-text-500 truncate">{member.email}</span>
            </Skeleton>
          </div>
        </div>
      </div>
      <div className="flex items-center px-4 w-[500px]">
        {member.role_name !== upperCaseFirstLetter(InviteMemberRoleEnum.OWNER) ? (
          <Menu menus={menus} trigger={input(member.role_name)} />
        ) : (
          input(member.role_name)
        )}
      </div>
      <div className="flex items-center px-4 text-text-500 text-xs font-medium">
        <Skeleton className="shrink-0" show={loading} width={64} height={16}>
          <span data-testid="last-activity">{timeAgo(new Date(member.last_activity_at || ''))} ago</span>
        </Skeleton>
      </div>
      <div className="flex items-center px-4 text-text-500 text-xs font-medium">
        <Skeleton className="shrink-0" show={loading} width={64} height={16}>
          <span data-testid="created-at">
            {dateYearMonthDayHourMinuteSecond(new Date(member.created_at || ''), false)}
          </span>
        </Skeleton>
      </div>
    </div>
  )
}

export default RowMember
