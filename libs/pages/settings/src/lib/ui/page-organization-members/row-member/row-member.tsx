import {
  type InviteMember,
  type InviteMemberRequest,
  type Member,
  type OrganizationAvailableRole,
} from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { MemberRoleEnum } from '@qovery/shared/enums'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  Avatar,
  ButtonIconAction,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Menu,
  type MenuData,
  type MenuItemProps,
  Skeleton,
  type TableFilterProps,
  TableRowFilter,
  ToastEnum,
  Tooltip,
  toast,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface RowMemberProps {
  member: Member | InviteMember
  loading: boolean
  columnsWidth: string
  filter: TableFilterProps[]
  transferOwnership?: (user: Member) => void
  editMemberRole?: (userId: string, roleId: string) => void
  deleteMember?: (userId: string) => void
  deleteInviteMember?: (inviteId: string) => void
  resendInvite?: (inviteId: string, data: InviteMemberRequest) => void
  availableRoles?: OrganizationAvailableRole[]
  loadingUpdateRole?: boolean
  userIsOwner?: boolean
}

export const RolesIcons: { [key: string]: string } = {
  ADMIN: IconAwesomeEnum.USER_CROWN,
  BILLING: IconAwesomeEnum.WALLET,
  DEVOPS: IconAwesomeEnum.WHEEL,
  VIEWER: IconAwesomeEnum.EYE,
}

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

  const [, copyToClipboard] = useCopyToClipboard()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()
  const { openModalConfirmation } = useModalConfirmation()

  const name = (member as Member).name?.split(' ') || (member as InviteMember).email.split(' ')

  const isOwner = member.role_name?.toUpperCase() === MemberRoleEnum.OWNER

  const menuItem = (role: OrganizationAvailableRole, customRole: boolean) => ({
    name: upperCaseFirstLetter(role.name),
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
          contentLeft: <Icon iconName="circle-plus" className="text-brand-500" />,
        },
      ],
    },
  ]

  const buttonActionMember = [
    {
      iconLeft: <Icon iconName="ellipsis-v" />,
      menus: [
        {
          items: userIsOwner
            ? [
                {
                  name: 'Transfer ownership',
                  onClick: () => transferOwnership && transferOwnership(member),
                  contentLeft: <Icon iconName="right-left" className="text-sm text-brand-500" />,
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
                  name: (member as Member).name,
                  action: () => deleteMember && deleteMember(member.id),
                })
              },
              contentLeft: <Icon iconName="ban" className="text-sm text-red-600" />,
              containerClassName: 'text-red-600',
            },
          ],
        },
      ],
    },
  ]

  const buttonActionInviteMember = [
    {
      iconLeft: <Icon iconName="ellipsis-v" />,
      menus: [
        {
          items: [
            {
              name: 'Resend invite',
              contentLeft: <Icon iconName="paper-plane" className="text-sm text-brand-500" />,
              onClick: () => {
                resendInvite && resendInvite(member.id, { email: member.email, role_id: member.role_id })
              },
            },
            {
              name: 'Copy invitation link',
              contentLeft: <Icon iconName="copy" className="text-sm text-brand-500" />,
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
                  name: (member as InviteMember).email,
                  action: () => deleteInviteMember && deleteInviteMember(member.id),
                })
              },
              contentLeft: <Icon iconName="ban" className="text-sm text-red-600" />,
              containerClassName: 'text-red-600',
            },
          ],
        },
      ],
    },
  ]

  const input = (role?: MemberRoleEnum | string) => (
    <Skeleton className="shrink-0" show={loading} width={176} height={30}>
      <div
        data-testid="input"
        className={`flex relative px-3 py-2 border rounded select-none w-44 ${
          role?.toUpperCase() === MemberRoleEnum.OWNER || !(member as Member).last_activity_at
            ? 'bg-neutral-100 border-neutral-250 text-neutral-350'
            : 'border-neutral-300 text-neutral-400 cursor-pointer'
        }`}
      >
        <span className="text-sm block max-w-[130px] truncate">{upperCaseFirstLetter(role)}</span>
        {!loadingUpdateRole && role?.toUpperCase() !== MemberRoleEnum.OWNER && (member as Member).last_activity_at && (
          <Icon
            name={IconAwesomeEnum.ANGLE_DOWN}
            className="absolute top-2.5 right-4 text-sm text-neutral-400 leading-3 translate-y-0.5 pointer-events-none"
          />
        )}
        {loadingUpdateRole && <LoaderSpinner className="w-4 h-4 absolute top-2.5 right-4" />}
      </div>
    </Skeleton>
  )

  return (
    <TableRowFilter data={member} filter={filter}>
      <div
        className="grid grid-cols-4 border-b border-neutral-200 last:border-0"
        style={{ gridTemplateColumns: columnsWidth }}
      >
        <div className="flex items-center justify-between pr-4 border-r border-neutral-200 h-full">
          <div className="flex items-center px-4 py-3">
            {name && (
              <Skeleton className="shrink-0" show={loading} width={32} height={32} rounded>
                <Avatar firstName={name[0]} lastName={name[1]} url={(member as Member).profile_picture_url} />
              </Skeleton>
            )}
            <div className="ml-3 text-xs truncate">
              <Skeleton className="mb-1" show={loading} width={120} height={16}>
                <p className="text-neutral-400 font-medium truncate">{(member as Member).name}</p>
              </Skeleton>
              <Skeleton show={loading} width={100} height={16}>
                <span className="text-neutral-400 truncate">{member.email}</span>
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
        <div className="flex items-center px-4 text-neutral-400 text-xs font-medium">
          <Skeleton className="shrink-0" show={loading} width={64} height={16}>
            {(member as Member).last_activity_at ? (
              <Tooltip content={dateUTCString((member as Member).last_activity_at!)}>
                <span data-testid="last-activity">
                  {timeAgo(new Date((member as Member).last_activity_at || ''))} ago
                </span>
              </Tooltip>
            ) : (
              <span>{upperCaseFirstLetter((member as InviteMember).invitation_status)}</span>
            )}
          </Skeleton>
        </div>
        <div className="flex items-center px-4 text-neutral-400 text-xs font-medium">
          <Skeleton className="shrink-0" show={loading} width={64} height={16}>
            <Tooltip content={dateUTCString(member.created_at)}>
              <span data-testid="created-at">{dateMediumLocalFormat(member.created_at)}</span>
            </Tooltip>
          </Skeleton>
        </div>
      </div>
    </TableRowFilter>
  )
}

export default RowMember
