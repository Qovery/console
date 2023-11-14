import { EnvironmentModeEnum, type InviteMemberRequest, type Member } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  useAvailableRoles,
  useCreateInviteMember,
  useDeleteInviteMember,
  useDeleteMember,
  useEditMemberRole,
  useInviteMembers,
  useMembers,
  useTransferOwnershipMemberRole,
} from '@qovery/domains/organizations/feature'
import { selectUser } from '@qovery/domains/users/data-access'
import { membersMock } from '@qovery/shared/factories'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type RootState } from '@qovery/state/store'
import PageOrganizationMembers from '../../ui/page-organization-members/page-organization-members'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

export const membersDataMock = membersMock(5)

export function PageOrganizationMembersFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Members - Organization settings')

  const { data: members = membersDataMock, isFetched: isFetchedMembers } = useMembers({ organizationId })
  const { data: inviteMembers = [] } = useInviteMembers({
    organizationId,
  })
  const { data: availableRoles = [] } = useAvailableRoles({ organizationId })
  const { mutateAsync: editMemberRole } = useEditMemberRole({ organizationId })
  const { mutateAsync: deleteMember } = useDeleteMember({ organizationId })
  const { mutateAsync: deleteInviteMember } = useDeleteInviteMember({ organizationId })
  const { mutateAsync: transferOwnershipMemberRole } = useTransferOwnershipMemberRole({ organizationId })
  const { mutateAsync: createInviteMember } = useCreateInviteMember({ organizationId })

  const userSub = useSelector((state: RootState) => selectUser(state)?.sub)

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
      mode: process.env['NODE_ENV'] === 'production' ? EnvironmentModeEnum.PRODUCTION : EnvironmentModeEnum.DEVELOPMENT,
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

  return (
    <PageOrganizationMembers
      userId={userSub}
      members={members}
      isFetchedMembers={isFetchedMembers}
      inviteMembers={inviteMembers}
      availableRoles={availableRoles}
      loadingUpdateRole={loadingUpdateRole}
      editMemberRole={onClickEditMemberRole}
      transferOwnership={onClickTransferOwnership}
      deleteMember={onClickDeleteMember}
      deleteInviteMember={onClickRevokeMemberInvite}
      resendInvite={onClickResendInvite}
      onAddMember={() => {
        openModal({
          content: (
            <CreateModalFeature organizationId={organizationId} onClose={closeModal} availableRoles={availableRoles} />
          ),
        })
      }}
    />
  )
}

export default PageOrganizationMembersFeature
