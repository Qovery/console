import {
  type InviteMember,
  type InviteMemberRequest,
  type Member,
  type OrganizationAvailableRole,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { MemberRoleEnum } from '@qovery/shared/enums'
import { ButtonLegacy, HelpSection, IconAwesomeEnum, Table, type TableFilterProps } from '@qovery/shared/ui'
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

const membersHead = [
  {
    title: 'Member',
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
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-neutral-400 mb-2">Manage your team</h1>
            <p className="text-neutral-400 text-xs max-w-content-with-navigation-left">
              This section allows you to manage the members of your organization (add / remove) and as well assign a
              role to each of them. You can invite someone to join your organization via email.
            </p>
          </div>
          <ButtonLegacy onClick={() => onAddMember && onAddMember()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add member
          </ButtonLegacy>
        </div>
        <Table
          className="border border-neutral-200 rounded"
          classNameHead="rounded-t"
          dataHead={membersHead}
          data={members}
          setFilter={setFilterMembers}
          filter={filterMembers}
          setDataSort={setDataMembers}
          columnsWidth={columnsWidth}
        >
          <div>
            {dataMembers?.map((member: Member) => (
              <RowMember
                key={member.id}
                filter={filterMembers}
                userIsOwner={userIsOwner?.role_name?.toUpperCase() === MemberRoleEnum.OWNER}
                loading={!isFetchedMembers}
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
            className="border border-neutral-200 rounded mt-5"
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
      </div>
      <HelpSection
        data-testid="help-section"
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/members-rbac/#organization-members',
            linkLabel: 'How to configure my organization members',
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationMembers
