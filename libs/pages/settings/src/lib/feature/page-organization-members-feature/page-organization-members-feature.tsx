import { InviteMember, InviteMemberRequest, Member } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteInviteMember,
  deleteMember,
  editMemberRole,
  fetchAvailableRoles,
  fetchInviteMembers,
  fetchMembers,
  postInviteMember,
  selectOrganizationById,
  transferOwnershipMemberRole,
} from '@qovery/domains/organization'
import { selectUser } from '@qovery/domains/user'
import { membersMock } from '@qovery/shared/factories'
import { ToastEnum, toast, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationMembers from '../../ui/page-organization-members/page-organization-members'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

const membersDataMock = membersMock(5)

export function PageOrganizationMembersFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Members - Organization settings')

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const membersLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.members?.loadingStatus
  )

  const inviteMembersLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.inviteMembers?.loadingStatus
  )

  const availableRolesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.availableRoles?.loadingStatus
  )

  const userSub = useSelector((state: RootState) => selectUser(state)?.sub)

  const dispatch = useDispatch<AppDispatch>()

  const { openModal, closeModal } = useModal()
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingUpdateRole, setLoadingUpdateRole] = useState({ userId: '', loading: false })
  const [loadingInviteMembers, setLoadingInviteMembers] = useState(false)

  const [dataMembers, setDataMembers] = useState<Member[]>(organization?.members?.items || membersDataMock)
  const [dataInviteMembers, setDataInviteMembers] = useState<InviteMember[]>(organization?.inviteMembers?.items || [])

  const fetchMembersDispatch = useCallback((): void => {
    dispatch(fetchMembers({ organizationId }))
      .unwrap()
      .then((result?: Member[]) => {
        result && setDataMembers(result)
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingMembers(false))
  }, [dispatch, organizationId])

  useEffect(() => {
    if (membersLoadingStatus !== 'loaded') setLoadingMembers(true)

    if (organization && membersLoadingStatus !== 'loaded') {
      fetchMembersDispatch()
    }

    if (organization && inviteMembersLoadingStatus !== 'loaded') {
      dispatch(fetchInviteMembers({ organizationId }))
        .unwrap()
        .then((result?: InviteMember[]) => {
          result && setDataInviteMembers(result)
        })
        .catch((e) => console.error(e))
        .finally(() => setLoadingInviteMembers(false))
    }

    if (organization && availableRolesLoadingStatus !== 'loaded') {
      dispatch(fetchAvailableRoles({ organizationId }))
    }
  }, [
    dispatch,
    organization,
    organizationId,
    fetchMembersDispatch,
    membersLoadingStatus,
    inviteMembersLoadingStatus,
    availableRolesLoadingStatus,
  ])

  const onClickEditMemberRole = (userId: string, roleId: string) => {
    const data = { user_id: userId, role_id: roleId }
    setLoadingUpdateRole({ userId, loading: true })

    dispatch(editMemberRole({ organizationId, data }))
      .unwrap()
      .finally(() => setLoadingUpdateRole({ userId, loading: false }))
  }

  const onClickDeleteMember = (userId: string) => {
    dispatch(deleteMember({ organizationId, userId }))
      .unwrap()
      .catch((e) => console.error(e))
  }

  const onClickRevokeMemberInvite = (inviteId: string) => {
    dispatch(deleteInviteMember({ organizationId, inviteId }))
      .unwrap()
      .catch((e) => console.error(e))
  }

  const onClickTransferOwnership = (userId: string) => {
    dispatch(transferOwnershipMemberRole({ organizationId, userId }))
      .unwrap()
      .then(() => fetchMembersDispatch())
  }

  const onClickResendInvite = (inviteId: string, data: InviteMemberRequest) => {
    dispatch(deleteInviteMember({ organizationId, inviteId, silentToaster: true }))
      .unwrap()
      .then(() => {
        dispatch(
          postInviteMember({
            organizationId: organizationId,
            data: data,
            silentToaster: true,
          })
        )
          .unwrap()
          .then(() => toast(ToastEnum.SUCCESS, 'Invitation sent'))
      })
      .catch((e) => console.error(e))
  }

  return (
    <PageOrganizationMembers
      userId={userSub}
      members={!loadingMembers ? organization?.members?.items : membersDataMock}
      dataMembers={dataMembers}
      setDataMembers={setDataMembers}
      loadingMembers={loadingMembers}
      dataInviteMembers={dataInviteMembers}
      setDataInviteMembers={setDataInviteMembers}
      loadingInviteMembers={loadingInviteMembers}
      inviteMembers={organization?.inviteMembers?.items}
      availableRoles={organization?.availableRoles?.items}
      loadingUpdateRole={loadingUpdateRole}
      editMemberRole={onClickEditMemberRole}
      transferOwnership={onClickTransferOwnership}
      deleteMember={onClickDeleteMember}
      deleteInviteMember={onClickRevokeMemberInvite}
      resendInvite={onClickResendInvite}
      onAddMember={() => {
        openModal({
          content: (
            <CreateModalFeature
              organizationId={organizationId}
              onClose={closeModal}
              availableRoles={organization?.availableRoles?.items || []}
            />
          ),
        })
      }}
    />
  )
}

export default PageOrganizationMembersFeature
