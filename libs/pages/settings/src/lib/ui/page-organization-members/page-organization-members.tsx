import {
  type InviteMember,
  type InviteMemberRequest,
  type Member,
  type OrganizationAvailableRole,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { MemberRoleEnum } from '@qovery/shared/enums'
import { Button, Heading, Icon, Section, Table, type TableFilterProps } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import RowMember from './row-member/row-member'

export interface PageOrganizationMembersProps {
  editMemberRole: (userId: string, roleId: string) => void
  deleteMember: (userId: string) => void
  deleteInviteMember: (inviteId: string) => void
  resendInvite: (inviteId: string, data: InviteMemberRequest) => void
  transferOwnership: (user: Member) => void
  loadingUpdateRole: { userId: string; loading: boolean }
  isFetchedMembers: boolean
  members?: Member[]
  inviteMembers?: InviteMember[]
  availableRoles?: OrganizationAvailableRole[]
  userId?: string
  onAddMember?: () => void
}

const inviteMembersHead = [
  {
    title: 'Pending members',
    className: 'px-4 py-2 border-r border-neutral-200 h-full',
  },
  {
    title: 'Roles',
  },
  {
    title: 'Status',
    className: 'px-4',
  },
  {
    title: 'Sent since',
    className: 'px-4',
    sort: {
      key: 'created_at',
    },
  },
]

export function PageOrganizationMembers(props: PageOrganizationMembersProps) {
  const {
    members = [],
    inviteMembers = [],
    deleteInviteMember,
    availableRoles,
    editMemberRole,
    isFetchedMembers,
    loadingUpdateRole,
    deleteMember,
    transferOwnership,
    userId,
    onAddMember,
    resendInvite,
  } = props

  const membersHead = [
    {
      title: `${pluralize(members.length, 'Member', 'Members')} ${isFetchedMembers ? `(${members.length})` : ''}`,
      className: 'px-4 py-2 border-r border-neutral-200 h-full',
    },
    {
      title: 'Roles',
      filter: [
        {
          search: true,
          title: 'Filter by role',
          key: 'role_name',
        },
      ],
    },
    {
      title: 'Last activity',
      className: 'px-4',
      sort: {
        key: 'last_activity_at',
      },
    },
    {
      title: 'Member since',
      className: 'px-4',
      sort: {
        key: 'created_at',
      },
    },
  ]

  const columnsWidth = '35% 22% 21% 21%'

  const [filterMembers, setFilterMembers] = useState<TableFilterProps[]>([])
  const [filterInviteMembers, setFilterInviteMembers] = useState<TableFilterProps[]>([])

  const [dataMembers, setDataMembers] = useState<Member[]>(members)
  const [dataInviteMembers, setDataInviteMembers] = useState<InviteMember[]>(inviteMembers)

  useEffect(() => {
    setDataMembers(members)
  }, [members, setDataMembers])

  useEffect(() => {
    setDataInviteMembers(inviteMembers)
  }, [inviteMembers, setDataInviteMembers])

  const userIsOwner = dataMembers?.find((member) => member.id === userId)

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <div className="mb-8 flex justify-between">
          <div className="space-y-3">
            <Heading className="text-neutral-400">Manage your team</Heading>
            <p className="max-w-content-with-navigation-left text-xs text-neutral-400">
              This section allows you to manage the members of your organization (add / remove) and as well assign a
              role to each of them. You can invite someone to join your organization via email.
            </p>
            <NeedHelp />
          </div>
          <Button onClick={() => onAddMember && onAddMember()} size="md" className="gap-2">
            Add member
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </div>
        <Table
          className="rounded border border-neutral-200"
          classNameHead="rounded-t"
          dataHead={membersHead}
          data={members}
          setFilter={setFilterMembers}
          filter={filterMembers}
          setDataSort={setDataMembers}
          columnsWidth={columnsWidth}
        >
          <div>
            {dataMembers?.map((member: Member, index) => (
              <RowMember
                key={member.id}
                filter={filterMembers}
                userIsOwner={userIsOwner?.role_name?.toUpperCase() === MemberRoleEnum.OWNER}
                loading={!isFetchedMembers || member.id === index.toString()}
                member={member}
                availableRoles={availableRoles}
                editMemberRole={editMemberRole}
                transferOwnership={transferOwnership}
                deleteMember={deleteMember}
                columnsWidth={columnsWidth}
                loadingUpdateRole={loadingUpdateRole.userId === member.id && loadingUpdateRole.loading}
              />
            ))}
          </div>
        </Table>
        {isFetchedMembers && dataInviteMembers?.length > 0 && (
          <Table
            className="mt-5 rounded border border-neutral-200"
            classNameHead="rounded-t"
            data={inviteMembers}
            dataHead={inviteMembersHead}
            setFilter={setFilterInviteMembers}
            filter={filterInviteMembers}
            setDataSort={setDataInviteMembers}
            columnsWidth={columnsWidth}
          >
            <div>
              {dataInviteMembers?.map((member: InviteMember) => (
                <RowMember
                  key={member.id}
                  loading={false}
                  member={member}
                  filter={filterInviteMembers}
                  availableRoles={availableRoles}
                  transferOwnership={transferOwnership}
                  deleteInviteMember={deleteInviteMember}
                  resendInvite={resendInvite}
                  columnsWidth={columnsWidth}
                />
              ))}
            </div>
          </Table>
        )}
      </Section>
    </div>
  )
}

export default PageOrganizationMembers
