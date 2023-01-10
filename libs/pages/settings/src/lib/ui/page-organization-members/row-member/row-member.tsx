import {
  InviteMember,
  InviteMemberRequest,
  InviteMemberRoleEnum,
  Member,
  OrganizationAvailableRole,
} from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { ToastEnum, toast } from '@qovery/shared/ui'
import {
  Avatar,
  ButtonIconAction,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Menu,
  MenuData,
  MenuItemProps,
  Skeleton,
  TableFilterProps,
  TableRowFilter,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { copyToClipboard, dateYearMonthDayHourMinuteSecond, timeAgo, upperCaseFirstLetter } from '@qovery/shared/utils'

export interface RowMemberProps {
  member: Member | InviteMember
  loading: boolean
  columnsWidth: string
  filter: TableFilterProps
  transferOwnership?: (userId: string) => void
  editMemberRole?: (userId: string, roleId: string) => void
  deleteMember?: (userId: string) => void
  deleteInviteMember?: (inviteId: string) => void
  resendInvite?: (inviteId: string, data: InviteMemberRequest) => void
  availableRoles?: OrganizationAvailableRole[]
  loadingUpdateRole?: boolean
  userIsOwner?: boolean
}

enum InviteMemberRoleExtendEnum {
  DEVOPS = 'DEVOPS',
  BILLING = 'BILLING',
}

export const RolesIcons: { [key: string]: string } = {
  ADMIN: IconAwesomeEnum.USER_CROWN,
  BILLING: IconAwesomeEnum.WALLET,
  DEVOPS: IconAwesomeEnum.WHEEL,
  VIEWER: IconAwesomeEnum.EYE,
}

type MemberRoleEnum = InviteMemberRoleEnum | InviteMemberRoleExtendEnum
export const MemberRoleEnum = { ...InviteMemberRoleEnum, ...InviteMemberRoleExtendEnum }

export function RowMember(props: RowMemberProps) {
  const {
    member,
    availableRoles,
    editMemberRole,
    loading,
    columnsWidth,
    loadingUpdateRole,
    deleteMember,
    deleteInviteMember,
    transferOwnership,
    resendInvite,
    userIsOwner,
    filter,
  } = props

  const { organizationId = '' } = useParams()
  const navigate = useNavigate()
  const { openModalConfirmation } = useModalConfirmation()

  const name = (member as Member).name?.split(' ') || (member as InviteMember).email.split(' ')

  const isOwner = member.role_name?.toUpperCase() === InviteMemberRoleEnum.OWNER

  const menuItem = (role: OrganizationAvailableRole, customRole: boolean) => ({
    name: upperCaseFirstLetter(role.name) || '',
    contentLeft: (
      <Icon
        name={customRole ? IconAwesomeEnum.USER : RolesIcons[role.name?.toUpperCase() || '']}
        className="text-brand-500"
      />
    ),
    onClick: () => editMemberRole && editMemberRole(member.id, role.id || ''),
  })

  const itemsBasicRoles = availableRoles
    ? (availableRoles
        .map(
          (role) =>
            Object.values(MemberRoleEnum).includes(role.name?.toUpperCase() as MemberRoleEnum) && menuItem(role, false)
        )
        .filter(Boolean) as MenuItemProps[])
    : []

  const itemsCustomRoles = availableRoles
    ? (availableRoles
        .map(
          (role) =>
            !Object.values(MemberRoleEnum).includes(role.name?.toUpperCase() as MemberRoleEnum) && menuItem(role, true)
        )
        .filter(Boolean) as MenuItemProps[])
    : []

  const menus: MenuData = [
    {
      items: itemsBasicRoles,
    },
    {
      items: itemsCustomRoles,
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

  const buttonActionMember = [
    {
      iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} />,
      menus: [
        {
          items: userIsOwner
            ? [
                {
                  name: 'Transfer ownership',
                  onClick: () => transferOwnership && transferOwnership(member.id),
                  contentLeft: <Icon name={IconAwesomeEnum.RIGHT_LEFT} className="text-sm text-brand-500" />,
                },
              ]
            : [],
        },
        {
          items: [
            {
              name: 'Delete member',
              onClick: () => {
                openModalConfirmation({
                  title: 'Confirm to remove this member',
                  isDelete: true,
                  description: 'Are you sure you want to delete this member?',
                  name: (member as Member).name,
                  action: () => deleteMember && deleteMember(member.id),
                })
              },
              contentLeft: <Icon name={IconAwesomeEnum.BAN} className="text-sm text-error-600" />,
              containerClassName: 'text-error-600',
            },
          ],
        },
      ],
    },
  ]

  const buttonActionInviteMember = [
    {
      iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} />,
      menus: [
        {
          items: [
            {
              name: 'Resend invite',
              contentLeft: <Icon name={IconAwesomeEnum.PAPER_PLANE} className="text-sm text-brand-500" />,
              onClick: () => {
                resendInvite && resendInvite(member.id, { email: member.email, role_id: member.role_id })
              },
            },
            {
              name: 'Copy invitation link',
              contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-500" />,
              onClick: () => {
                copyToClipboard((member as InviteMember).invitation_link)
                toast(ToastEnum.SUCCESS, 'Copied to your clipboard!')
              },
            },
          ],
        },
        {
          items: [
            {
              name: 'Revoke invite',
              onClick: () => {
                openModalConfirmation({
                  title: 'Confirm to remove this invite',
                  isDelete: true,
                  description: 'Are you sure you want to delete this member?',
                  name: (member as InviteMember).email,
                  action: () => deleteInviteMember && deleteInviteMember(member.id),
                })
              },
              contentLeft: <Icon name={IconAwesomeEnum.BAN} className="text-sm text-error-600" />,
              containerClassName: 'text-error-600',
            },
          ],
        },
      ],
    },
  ]

  const input = (role?: InviteMemberRoleEnum | string) => (
    <Skeleton className="shrink-0" show={loading} width={176} height={30}>
      <div
        data-testid="input"
        className={`flex relative px-3 py-2 border rounded select-none w-44 ${
          role?.toUpperCase() === InviteMemberRoleEnum.OWNER || !(member as Member).last_activity_at
            ? 'bg-element-light-lighter-200 border-element-light-lighter-500 text-text-400'
            : 'border-element-light-ligther-600 text-text-600 cursor-pointer'
        }`}
      >
        <span className="text-sm">{upperCaseFirstLetter(role)}</span>
        {!loadingUpdateRole &&
          role?.toUpperCase() !== InviteMemberRoleEnum.OWNER &&
          (member as Member).last_activity_at && (
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
    <TableRowFilter data={member} filter={filter}>
      <div
        className="grid grid-cols-4 border-b border-element-light-lighter-400 last:border-0"
        style={{ gridTemplateColumns: columnsWidth }}
      >
        <div className="flex items-center justify-between pr-4 border-r border-element-light-lighter-400 h-full">
          <div className="flex items-center px-4 py-3">
            {name && (
              <Skeleton className="shrink-0" show={loading} width={32} height={32} rounded>
                <Avatar firstName={name[0]} lastName={name[1]} url={(member as Member).profile_picture_url} />
              </Skeleton>
            )}
            <div className="ml-3 text-xs truncate">
              <Skeleton className="mb-1" show={loading} width={120} height={16}>
                <p className="text-text-600 font-medium truncate">{(member as Member).name}</p>
              </Skeleton>
              <Skeleton show={loading} width={100} height={16}>
                <span className="text-text-500 truncate">{member.email}</span>
              </Skeleton>
            </div>
          </div>
          {!isOwner && (
            <Skeleton className="shrink-0" show={loading} width={28} height={26}>
              {(member as Member).last_activity_at ? (
                <ButtonIconAction actions={buttonActionMember} />
              ) : (
                <ButtonIconAction actions={buttonActionInviteMember} />
              )}
            </Skeleton>
          )}
        </div>
        <div data-testid="row-member-menu" className="flex items-center px-4 w-[500px]">
          {!isOwner && (member as Member).last_activity_at ? (
            <Menu menus={menus} trigger={input(member.role_name)} />
          ) : (
            input(member.role_name)
          )}
        </div>
        <div className="flex items-center px-4 text-text-500 text-xs font-medium">
          <Skeleton className="shrink-0" show={loading} width={64} height={16}>
            {(member as Member).last_activity_at ? (
              <span data-testid="last-activity">
                {timeAgo(new Date((member as Member).last_activity_at || ''))} ago
              </span>
            ) : (
              <span>{upperCaseFirstLetter((member as InviteMember).invitation_status)}</span>
            )}
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
    </TableRowFilter>
  )
}

export default RowMember
