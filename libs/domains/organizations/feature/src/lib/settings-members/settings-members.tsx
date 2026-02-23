import { useAuth0 } from '@auth0/auth0-react'
import { useParams } from '@tanstack/react-router'
import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  EnvironmentModeEnum,
  type InviteMember,
  type InviteMemberRequest,
  type Member,
  type OrganizationAvailableRole,
} from 'qovery-typescript-axios'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { match } from 'ts-pattern'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { MemberRoleEnum } from '@qovery/shared/enums'
import {
  Button,
  Callout,
  Icon,
  Section,
  Skeleton as SkeletonPrimitive,
  TableFilter,
  TablePrimitives,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { pluralize } from '@qovery/shared/util-js'
import { NODE_ENV } from '@qovery/shared/util-node-env'
import { type SerializedError } from '@qovery/shared/utils'
import { useAvailableRoles } from '../hooks/use-available-roles/use-available-roles'
import { useCreateInviteMember } from '../hooks/use-create-invite-member/use-create-invite-member'
import { useDeleteInviteMember } from '../hooks/use-delete-invite-member/use-delete-invite-member'
import { useDeleteMember } from '../hooks/use-delete-member/use-delete-member'
import { useEditMemberRole } from '../hooks/use-edit-member-role/use-edit-member-role'
import { useInviteMembers } from '../hooks/use-invite-members/use-invite-members'
import { useMembers } from '../hooks/use-members/use-members'
import { useTransferOwnershipMemberRole } from '../hooks/use-transfer-ownership-member-role/use-transfer-ownership-member-role'
import CreateModal from './create-modal/create-modal'
import RowMember from './row-member/row-member'

const { Table } = TablePrimitives

const Skeleton = () => {
  const columnSizes = ['35%', '22%', '21%', '21%']

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row className="text-xs">
          {columnSizes.map((columnSize, index) => (
            <Table.ColumnHeaderCell
              key={columnSize}
              className={`border-neutral text-xs font-medium text-neutral ${index === 0 ? 'border-r' : ''}`}
              style={{ width: columnSize }}
            >
              <SkeletonPrimitive height={16} width={index === 0 ? 140 : 72} show={true} />
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body className="divide-y divide-neutral">
        {Array.from({ length: 10 }).map((_, rowIndex) => (
          <Table.Row key={rowIndex}>
            <Table.Cell className="border-r border-neutral px-0" style={{ width: columnSizes[0] }}>
              <div className="flex h-full items-center justify-between pr-4">
                <div className="flex items-center px-4 py-3">
                  <SkeletonPrimitive className="shrink-0" width={32} height={32} rounded show={true} />
                  <div className="ml-3 flex flex-col gap-1">
                    <SkeletonPrimitive width={120} height={16} show={true} />
                    <SkeletonPrimitive width={100} height={16} show={true} />
                  </div>
                </div>
                <SkeletonPrimitive className="shrink-0" width={28} height={26} show={true} />
              </div>
            </Table.Cell>
            <Table.Cell className="px-4" style={{ width: columnSizes[1] }}>
              <SkeletonPrimitive className="shrink-0" width={176} height={30} show={true} />
            </Table.Cell>
            <Table.Cell className="px-4" style={{ width: columnSizes[2] }}>
              <SkeletonPrimitive className="shrink-0" width={64} height={16} show={true} />
            </Table.Cell>
            <Table.Cell className="px-4" style={{ width: columnSizes[3] }}>
              <SkeletonPrimitive className="shrink-0" width={64} height={16} show={true} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

interface MembersTableProps {
  editMemberRole: (userId: string, roleId: string) => void
  deleteMember: (userId: string) => void
  deleteInviteMember: (inviteId: string) => void
  resendInvite: (inviteId: string, data: InviteMemberRequest) => void
  transferOwnership: (user: Member) => void
  loadingUpdateRole: { userId: string; loading: boolean }
  members?: Member[]
  inviteMembers?: InviteMember[]
  availableRoles?: OrganizationAvailableRole[]
  userId?: string
}

interface MembersTableWithDataProps extends Omit<
  MembersTableProps,
  'members' | 'inviteMembers' | 'availableRoles'
> {
  organizationId: string
}

const MembersTable = (props: MembersTableProps) => {
  const {
    members = [],
    inviteMembers = [],
    deleteInviteMember,
    availableRoles,
    editMemberRole,
    loadingUpdateRole,
    deleteMember,
    transferOwnership,
    userId,
    resendInvite,
  } = props

  const columnSizes = [35, 22, 21, 21]
  const membersCountLabel = `${pluralize(members.length, 'Member', 'Members')} (${members.length})`

  const memberColumnHelper = createColumnHelper<Member>()
  const inviteColumnHelper = createColumnHelper<InviteMember>()

  const memberColumns = useMemo(
    () => [
      memberColumnHelper.display({
        id: 'member',
        header: 'Member',
      }),
      memberColumnHelper.accessor('role_name', {
        header: 'Roles',
        enableColumnFilter: true,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
      }),
      memberColumnHelper.accessor(
        (member) => (member.last_activity_at ? new Date(member.last_activity_at).getTime() : 0),
        {
          id: 'last_activity_at',
          header: 'Last activity',
          enableColumnFilter: false,
          enableSorting: true,
        }
      ),
      memberColumnHelper.accessor((member) => new Date(member.created_at).getTime(), {
        id: 'created_at',
        header: 'Member since',
        enableColumnFilter: false,
        enableSorting: true,
      }),
    ],
    []
  )

  const inviteColumns = useMemo(
    () => [
      inviteColumnHelper.display({
        id: 'invite_member',
        header: 'Pending members',
      }),
      inviteColumnHelper.display({
        id: 'invite_roles',
        header: 'Roles',
      }),
      inviteColumnHelper.display({
        id: 'invite_status',
        header: 'Status',
      }),
      inviteColumnHelper.accessor((member) => new Date(member.created_at).getTime(), {
        id: 'created_at',
        header: 'Sent since',
        enableColumnFilter: false,
        enableSorting: true,
      }),
    ],
    []
  )

  const [memberSorting, setMemberSorting] = useState<SortingState>([])
  const [inviteSorting, setInviteSorting] = useState<SortingState>([])

  const membersTable = useReactTable({
    data: members,
    columns: memberColumns,
    state: {
      sorting: memberSorting,
    },
    onSortingChange: setMemberSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // https://github.com/TanStack/table/discussions/3192#discussioncomment-6458134
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  const inviteTable = useReactTable({
    data: inviteMembers,
    columns: inviteColumns,
    state: {
      sorting: inviteSorting,
    },
    onSortingChange: setInviteSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // https://github.com/TanStack/table/discussions/3192#discussioncomment-6458134
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  })

  const userIsOwner = members.find((member) => member.id === userId)

  return (
    <>
      <Table.Root>
        <Table.Header>
          {membersTable.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} className="text-xs">
              {headerGroup.headers.map((header, index) => (
                <Table.ColumnHeaderCell
                  key={header.id}
                  className={`border-neutral text-xs font-medium text-neutral ${index === 0 ? 'border-r' : ''}`}
                  style={{ width: `${columnSizes[index]}%` }}
                >
                  {header.isPlaceholder ? null : index === 0 ? (
                    membersCountLabel
                  ) : header.column.getCanFilter() ? (
                    <TableFilter column={header.column} />
                  ) : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {match(header.column.getIsSorted())
                        .with('asc', () => <Icon className="text-xs" iconName="arrow-down" />)
                        .with('desc', () => <Icon className="text-xs" iconName="arrow-up" />)
                        .with(false, () => null)
                        .exhaustive()}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body className="divide-y divide-neutral">
          {membersTable.getRowModel().rows.map((row) => (
            <RowMember
              key={row.original.id}
              userIsOwner={userIsOwner?.role_name?.toUpperCase() === MemberRoleEnum.OWNER}
              member={row.original}
              availableRoles={availableRoles}
              editMemberRole={editMemberRole}
              transferOwnership={transferOwnership}
              deleteMember={deleteMember}
              columnSizes={columnSizes}
              loadingUpdateRole={loadingUpdateRole.userId === row.original.id && loadingUpdateRole.loading}
            />
          ))}
        </Table.Body>
      </Table.Root>
      {inviteMembers.length > 0 && (
        <Table.Root>
          <Table.Header>
            {inviteTable.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} className="text-xs">
                {headerGroup.headers.map((header, index) => (
                  <Table.ColumnHeaderCell
                    key={header.id}
                    className={`border-neutral text-xs font-medium text-neutral ${index === 0 ? 'border-r' : ''}`}
                    style={{ width: `${columnSizes[index]}%` }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {match(header.column.getIsSorted())
                          .with('asc', () => <Icon className="text-xs" iconName="arrow-down" />)
                          .with('desc', () => <Icon className="text-xs" iconName="arrow-up" />)
                          .with(false, () => null)
                          .exhaustive()}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body className="divide-y divide-neutral">
            {inviteTable.getRowModel().rows.map((row) => (
              <RowMember
                key={row.original.id}
                member={row.original}
                availableRoles={availableRoles}
                transferOwnership={transferOwnership}
                deleteInviteMember={deleteInviteMember}
                resendInvite={resendInvite}
                columnSizes={columnSizes}
              />
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </>
  )
}

const MembersTableWithData = ({
  organizationId,
  editMemberRole,
  deleteMember,
  deleteInviteMember,
  resendInvite,
  transferOwnership,
  loadingUpdateRole,
  userId,
}: MembersTableWithDataProps) => {
  const { data: members = [] } = useMembers({ organizationId, suspense: true })
  const { data: inviteMembers = [] } = useInviteMembers({ organizationId, suspense: true })
  const { data: availableRoles = [] } = useAvailableRoles({ organizationId, suspense: true })

  return (
    <MembersTable
      members={members}
      inviteMembers={inviteMembers}
      availableRoles={availableRoles}
      editMemberRole={editMemberRole}
      deleteMember={deleteMember}
      deleteInviteMember={deleteInviteMember}
      resendInvite={resendInvite}
      transferOwnership={transferOwnership}
      loadingUpdateRole={loadingUpdateRole}
      userId={userId}
    />
  )
}

export function SettingsMembers() {
  useDocumentTitle('Members - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const hasPreviousRequestFailed = useRef<boolean>(false)

  const { error: membersError, isSuccess: isSuccessMembers } = useMembers({ organizationId })
  const { data: availableRoles = [] } = useAvailableRoles({ organizationId })

  const hasPermissionError = (membersError as SerializedError)?.response?.status === 403
  const shouldShowPermissionError = hasPermissionError || hasPreviousRequestFailed.current
  const { mutateAsync: editMemberRole } = useEditMemberRole()
  const { mutateAsync: deleteMember } = useDeleteMember()
  const { mutateAsync: deleteInviteMember } = useDeleteInviteMember()
  const { mutateAsync: transferOwnershipMemberRole } = useTransferOwnershipMemberRole()
  const { mutateAsync: createInviteMember } = useCreateInviteMember()

  const { user } = useAuth0()

  const { openModal, closeModal } = useModal()
  const [loadingUpdateRole, setLoadingUpdateRole] = useState({ userId: '', loading: false })

  const { openModalConfirmation } = useModalConfirmation()

  const onClickEditMemberRole = async (userId: string, roleId: string) => {
    const data = { user_id: userId, role_id: roleId }
    setLoadingUpdateRole({ userId, loading: true })

    try {
      await editMemberRole({ organizationId, memberRoleUpdateRequest: data })
      setLoadingUpdateRole({ userId, loading: false })
    } catch (error) {
      console.error(error)
    }
  }

  const onClickDeleteMember = async (userId: string) => {
    try {
      await deleteMember({ organizationId, userId })
    } catch (error) {
      console.error(error)
    }
  }

  const onClickRevokeMemberInvite = async (inviteId: string) => {
    try {
      await deleteInviteMember({ organizationId, inviteId })
    } catch (error) {
      console.error(error)
    }
  }

  const onClickTransferOwnership = (user: Member) => {
    openModalConfirmation({
      title: 'Confirm ownership transfer',
      description: 'Confirm by entering the member name',
      name: user?.name,
      mode: NODE_ENV === 'production' ? EnvironmentModeEnum.PRODUCTION : EnvironmentModeEnum.DEVELOPMENT,
      action: async () => {
        try {
          await transferOwnershipMemberRole({ organizationId, userId: user.id })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const onClickResendInvite = async (inviteId: string, data: InviteMemberRequest) => {
    try {
      await deleteInviteMember({ organizationId, inviteId })
      await createInviteMember({ organizationId, inviteMemberRequest: data })
    } catch (error) {
      console.error(error)
    }
  }

  const onAddMember = () => {
    openModal({
      content: <CreateModal organizationId={organizationId} onClose={closeModal} availableRoles={availableRoles} />,
      options: {
        fakeModal: true,
      },
    })
  }

  useEffect(() => {
    if (isSuccessMembers) {
      hasPreviousRequestFailed.current = false
    }

    if (hasPermissionError) {
      hasPreviousRequestFailed.current = true
    }
  }, [hasPermissionError, isSuccessMembers])

  return (
    <div className="w-full">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading
            title="Manage your team"
            description="This section allows you to manage the members of your organization (add / remove) and as well assign a
              role to each of them. You can invite someone to join your organization via email."
          />

          <Button className="absolute right-0 top-0 gap-2" size="md" onClick={onAddMember}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add member
          </Button>
        </div>
        {shouldShowPermissionError && (
          <Callout.Root color="yellow" className="mb-8">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Permission denied</Callout.TextHeading>
              <Callout.TextDescription>
                You do not have the permission to view other members. Please contact your organization administrator.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
        <div className="flex flex-col gap-6">
          <Suspense fallback={<Skeleton />}>
            <MembersTableWithData
              organizationId={organizationId}
              userId={user?.sub}
              editMemberRole={onClickEditMemberRole}
              transferOwnership={onClickTransferOwnership}
              deleteMember={onClickDeleteMember}
              deleteInviteMember={onClickRevokeMemberInvite}
              resendInvite={onClickResendInvite}
              loadingUpdateRole={loadingUpdateRole}
            />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
