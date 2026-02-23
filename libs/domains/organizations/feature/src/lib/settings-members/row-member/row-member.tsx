import {
  type InviteMember,
  type InviteMemberRequest,
  type Member,
  type OrganizationAvailableRole,
} from 'qovery-typescript-axios'
import { IconEnum, MemberRoleEnum } from '@qovery/shared/enums'
import {
  Avatar,
  ButtonPrimitive,
  DropdownMenu,
  Icon,
  Indicator,
  InputSelectSmall,
  TablePrimitives,
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
  columnSizes: number[]
  transferOwnership?: (user: Member) => void
  editMemberRole?: (userId: string, roleId: string) => void
  deleteMember?: (userId: string) => void
  deleteInviteMember?: (inviteId: string) => void
  resendInvite?: (inviteId: string, data: InviteMemberRequest) => void
  availableRoles?: OrganizationAvailableRole[]
  loadingUpdateRole?: boolean
  userIsOwner?: boolean
}

const { Table } = TablePrimitives

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
    loadingUpdateRole,
    columnSizes,
    deleteMember,
    deleteInviteMember,
    transferOwnership,
    resendInvite,
    userIsOwner,
  } = props

  const [, copyToClipboard] = useCopyToClipboard()
  const { openModalConfirmation } = useModalConfirmation()

  const name = (member as Member).name?.split(' ') || (member as InviteMember).email.split(' ')

  const isOwner = member.role_name?.toUpperCase() === MemberRoleEnum.OWNER

  const canEditRole = !isOwner && Boolean((member as Member).last_activity_at)

  const roleOptions =
    availableRoles?.map((role) => ({
      label: upperCaseFirstLetter(role.name),
      value: role.id || role.name || '',
    })) ?? []
  const selectedRoleValue =
    availableRoles?.find((role) => role.name?.toUpperCase() === member.role_name?.toUpperCase())?.id ??
    member.role_id ??
    ''

  const handleRoleChange = (roleId: string | undefined) => {
    if (!roleId) return
    editMemberRole?.(member.id, roleId)
  }

  return (
    <Table.Row>
      <Table.Cell className="border-r border-neutral px-0" style={{ width: `${columnSizes[0]}%` }}>
        <div className="flex h-full items-center justify-between pr-4">
          <div className="flex items-center px-4 py-3">
            {name && (
              <Indicator
                className="bottom-1 right-1"
                side="bottom"
                content={
                  getProviderIcon(member.id) && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-neutral">
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-neutral-component">
                      {name[0]?.charAt(0).toUpperCase()}
                      {name[1]?.charAt(0).toUpperCase()}
                    </span>
                  }
                />
              </Indicator>
            )}
            <div className="ml-3 truncate text-xs">
              <p className="mb-1 truncate font-medium text-neutral">{(member as Member).name}</p>
              <span className="truncate text-neutral-subtle">{member.email}</span>
            </div>
          </div>
          {!isOwner && (
            <>
              {(member as Member).last_activity_at ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <ButtonPrimitive
                      type="button"
                      data-testid="element"
                      aria-label="Member actions"
                      variant="outline"
                      color="neutral"
                      size="md"
                      iconOnly
                    >
                      <Icon iconName="ellipsis-v" />
                    </ButtonPrimitive>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    {userIsOwner ? (
                      <>
                        <DropdownMenu.Item
                          data-testid="menuItem"
                          icon={<Icon iconName="right-left" iconStyle="regular" />}
                          onSelect={() => transferOwnership?.(member as Member)}
                        >
                          Transfer ownership
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                      </>
                    ) : null}
                    <DropdownMenu.Item
                      data-testid="menuItem"
                      color="red"
                      icon={<Icon iconName="ban" iconStyle="regular" />}
                      onSelect={() => {
                        openModalConfirmation({
                          title: 'Confirm to remove this member',
                          confirmationMethod: 'action',
                          name: (member as Member).name,
                          action: () => deleteMember?.(member.id),
                        })
                      }}
                    >
                      Delete member
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <ButtonPrimitive
                      type="button"
                      data-testid="element"
                      aria-label="Invite actions"
                      variant="outline"
                      color="neutral"
                      size="md"
                      iconOnly
                    >
                      <Icon iconName="ellipsis-v" />
                    </ButtonPrimitive>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item
                      data-testid="menuItem"
                      icon={<Icon iconName="paper-plane" />}
                      onSelect={() => {
                        resendInvite?.(member.id, { email: member.email, role_id: member.role_id })
                      }}
                    >
                      Resend invite
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      data-testid="menuItem"
                      icon={<Icon iconName="copy" />}
                      onSelect={() => {
                        copyToClipboard((member as InviteMember).invitation_link)
                        toast(ToastEnum.SUCCESS, 'Copied to your clipboard!')
                      }}
                    >
                      Copy invitation link
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                      data-testid="menuItem"
                      color="red"
                      icon={<Icon iconName="ban" />}
                      onSelect={() => {
                        openModalConfirmation({
                          title: 'Confirm to remove this invite',
                          confirmationMethod: 'action',
                          name: (member as InviteMember).email,
                          action: () => deleteInviteMember?.(member.id),
                        })
                      }}
                    >
                      Revoke invite
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              )}
            </>
          )}
        </div>
      </Table.Cell>
      <Table.Cell className="px-4" style={{ width: `${columnSizes[1]}%` }}>
        <div data-testid="row-member-menu" className="flex items-center">
          <InputSelectSmall
            dataTestId="input"
            name={`member-role-${member.id}`}
            className="w-44"
            inputClassName="w-44"
            items={roleOptions}
            defaultValue={selectedRoleValue}
            onChange={canEditRole ? handleRoleChange : undefined}
            disabled={!canEditRole || loadingUpdateRole}
          />
        </div>
      </Table.Cell>
      <Table.Cell className="px-4 text-xs text-neutral" style={{ width: `${columnSizes[2]}%` }}>
        {(member as Member).last_activity_at ? (
          <Tooltip content={dateUTCString((member as Member).last_activity_at!)}>
            <span data-testid="last-activity">
              {timeAgo(new Date((member as Member).last_activity_at || ''))} ago
            </span>
          </Tooltip>
        ) : (
          <span>{upperCaseFirstLetter((member as InviteMember).invitation_status)}</span>
        )}
      </Table.Cell>
      <Table.Cell className="px-4 text-xs text-neutral" style={{ width: `${columnSizes[3]}%` }}>
        <Tooltip content={dateUTCString(member.created_at)}>
          <span data-testid="created-at">{dateMediumLocalFormat(member.created_at)}</span>
        </Tooltip>
      </Table.Cell>
    </Table.Row>
  )
}

export default RowMember
