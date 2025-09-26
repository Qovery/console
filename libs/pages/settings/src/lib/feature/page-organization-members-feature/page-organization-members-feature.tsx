import { useAuth0 } from '@auth0/auth0-react'
import { EnvironmentModeEnum, type InviteMemberRequest, type Member } from 'qovery-typescript-axios'
import { useEffect, useRef, useState } from 'react'
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
import { membersMock } from '@qovery/shared/factories'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { NODE_ENV } from '@qovery/shared/util-node-env'
import { type SerializedError } from '@qovery/shared/utils'
import PageOrganizationMembers from '../../ui/page-organization-members/page-organization-members'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

export const membersDataMock = membersMock(5)

export function PageOrganizationMembersFeature() {
  useDocumentTitle('Members - Organization settings')
  const { organizationId = '' } = useParams()
  const hasPreviousRequestFailed = useRef<boolean>(false)

  const {
    data: members = membersDataMock,
    isFetched: isFetchedMembers,
    error: membersError,
    isSuccess: isSuccessMembers,
  } = useMembers({ organizationId })
  const { data: inviteMembers = [] } = useInviteMembers({
    organizationId,
  })
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

  useEffect(() => {
    if (isSuccessMembers) {
      hasPreviousRequestFailed.current = false
    }

    if (hasPermissionError) {
      hasPreviousRequestFailed.current = true
    }
  }, [hasPermissionError, isSuccessMembers])

  return (
    <PageOrganizationMembers
      userId={user?.sub}
      members={members}
      isFetchedMembers={isFetchedMembers}
      inviteMembers={inviteMembers}
      availableRoles={availableRoles}
      loadingUpdateRole={loadingUpdateRole}
      hasPermissionError={shouldShowPermissionError}
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
