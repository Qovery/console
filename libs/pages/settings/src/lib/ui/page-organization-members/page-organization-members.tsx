import { InviteMember, Member, OrganizationAvailableRole } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Button, HelpSection, IconAwesomeEnum, Table } from '@qovery/shared/ui'
import RowMember from './row-member/row-member'

export interface PageOrganizationMembersProps {
  editMemberRole: (userId: string, roleId: string) => void
  members?: Member[]
  inviteMembers?: InviteMember[]
  availableRoles?: OrganizationAvailableRole[]
}

const membersHead = [
  {
    title: 'Member',
    className: 'px-4 py-2 border-r border-element-light-lighter-400 h-full',
  },
  {
    title: 'Roles',
    filter: [
      {
        search: true,
        title: 'Filter by role',
        key: 'role',
      },
    ],
  },
  {
    title: 'Last activity',
    className: 'px-4',
    sort: {
      key: 'updated_at',
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

export function PageOrganizationMembers(props: PageOrganizationMembersProps) {
  const { members, availableRoles, editMemberRole } = props

  const [filterMembers, setFilterMembers] = useState<Member[]>([])

  useEffect(() => {
    members && setFilterMembers(members)
  }, [members])

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Manage your team</h1>
            <p className="text-text-500 text-xs max-w-content-with-navigation-left">
              This section allows you to manage the members of your organization (add / remove) and as well assign a
              role to each of them. You can invite someone to join your organization by email. Then he will get access
              to your projects and will be able to contribute.
            </p>
          </div>
          <Button onClick={() => console.log('add')} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add member
          </Button>
        </div>
        <Table
          className="border border-element-light-lighter-400 rounded"
          classNameHead="rounded-t"
          dataHead={membersHead}
          setFilterData={setFilterMembers}
          filterData={filterMembers}
          defaultData={members}
        >
          <div>
            {availableRoles &&
              filterMembers.map((member: Member) => (
                <RowMember
                  key={member.id}
                  member={member}
                  availableRoles={availableRoles}
                  editMemberRole={editMemberRole}
                />
              ))}
          </div>
        </Table>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members',
            linkLabel: 'How to configure my organization members',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationMembers
