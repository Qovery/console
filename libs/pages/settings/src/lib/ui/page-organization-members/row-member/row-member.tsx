import { type IconName } from '@fortawesome/fontawesome-common-types'
import {
  type InviteMember,
  type InviteMemberRequest,
  type Member,
  type OrganizationAvailableRole,
} from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { IconEnum, MemberRoleEnum } from '@qovery/shared/enums'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  Avatar,
  ButtonIconAction,
  Icon,
  IconAwesomeEnum,
  Indicator,
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

export const RolesIcons: { [key: string]: IconName } = {
  ADMIN: 'crown',
  BILLING: 'wallet',
  DEVOPS: 'gear',
  VIEWER: 'eye',
}

const getProviderIcon = (id: string): IconEnum | undefined => {
  if (id.toUpperCase().includes('GITHUB')) {
    return IconEnum.GITHUB
  } else if (id.toUpperCase().includes('GITLAB')) {
    return IconEnum.GITLAB
  } else if (id.toUpperCase().includes('BITBUCKET')) {
    return IconEnum.BITBUCKET
  } else if (id.toUpperCase().includes('GOOGLE')) {
    return IconEnum.GOOGLE
  } else if (id.toUpperCase().includes('WINDOWSLIVE')) {
    return IconEnum.MICROSOFT
  } else {
    return undefined
  }
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
      <Icon iconName={customRole ? 'user' : RolesIcons[role.name?.toUpperCase() || '']} className="text-brand-500" />
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
                  contentLeft: <Icon iconName="right-left" iconStyle="regular" className="text-sm text-brand-500" />,
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
              contentLeft: <Icon iconName="ban" iconStyle="regular" className="text-sm text-red-600" />,
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
        className={`relative flex h-9 w-44 select-none items-center rounded border px-3 ${
          role?.toUpperCase() === MemberRoleEnum.OWNER || !(member as Member).last_activity_at
            ? 'border-neutral-250 bg-neutral-100 text-neutral-350'
            : 'cursor-pointer border-neutral-300 text-neutral-400'
        }`}
      >
        <span className="block max-w-[130px] truncate text-sm">{upperCaseFirstLetter(role)}</span>
        {!loadingUpdateRole && role?.toUpperCase() !== MemberRoleEnum.OWNER && (member as Member).last_activity_at && (
          <Icon
            name={IconAwesomeEnum.ANGLE_DOWN}
            className="pointer-events-none absolute right-4 top-2.5 translate-y-0.5 text-sm leading-3 text-neutral-400"
          />
        )}
        {loadingUpdateRole && <LoaderSpinner className="absolute right-4 top-2.5 h-4 w-4" />}
      </div>
    </Skeleton>
  )

  return (
    <TableRowFilter data={member} filter={filter}>
      <div
        className="grid grid-cols-4 border-b border-neutral-200 last:border-0"
        style={{ gridTemplateColumns: columnsWidth }}
      >
        <div className="flex h-full items-center justify-between border-r border-neutral-200 pr-4">
          <div className="flex items-center px-4 py-3">
            {name && (
              <Skeleton className="shrink-0" show={loading} width={32} height={32} rounded>
                <Indicator
                  className="bottom-1 right-1"
                  side="bottom"
                  content={
                    getProviderIcon(member.id) && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
                        <Icon name={getProviderIcon(member.id)} className="p-0.5 text-base" width={20} height={20} />
                      </span>
                    )
                  }
                >
                  <Avatar
                    size="sm"
                    radius="full"
                    src={(member as Member).profile_picture_url}
                    fallback={
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
                        {name[0]?.charAt(0).toUpperCase()}
                        {name[1]?.charAt(0).toUpperCase()}
                      </span>
                    }
                  />
                </Indicator>
              </Skeleton>
            )}
            <div className="ml-3 truncate text-xs">
              <Skeleton className="mb-1" show={loading} width={120} height={16}>
                <p className="truncate font-medium text-neutral-400">{(member as Member).name}</p>
              </Skeleton>
              <Skeleton show={loading} width={100} height={16}>
                <span className="truncate text-neutral-400">{member.email}</span>
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
        <div data-testid="row-member-menu" className="flex w-[500px] items-center px-4">
          {!isOwner && (member as Member).last_activity_at ? (
            <Menu menus={menus} trigger={input(member.role_name)} />
          ) : (
            input(member.role_name)
          )}
        </div>
        <div className="flex items-center px-4 text-xs font-medium text-neutral-400">
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
        <div className="flex items-center px-4 text-xs font-medium text-neutral-400">
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
