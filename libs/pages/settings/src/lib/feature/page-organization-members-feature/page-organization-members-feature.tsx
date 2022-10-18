import { Member } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteMember,
  editMemberRole,
  fetchAvailableRoles,
  fetchInviteMembers,
  fetchMembers,
  membersMock,
  selectOrganizationById,
  transferOwnershipMemberRole,
} from '@qovery/domains/organization'
import { selectUser } from '@qovery/domains/user'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationMembers from '../../ui/page-organization-members/page-organization-members'

const membersDataMock = membersMock(5)

export function PageOrganizationMembersFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Members - Organization settings')

  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingUpdateRole, setLoadingUpdateRole] = useState({ userId: '', loading: false })

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

  const user = useSelector(selectUser)

  const dispatch = useDispatch<AppDispatch>()

  const [filterMembers, setFilterMembers] = useState<Member[]>(organization?.members?.items || membersDataMock)

  const fetchMembersDispatch = useCallback((): void => {
    dispatch(fetchMembers({ organizationId }))
      .unwrap()
      .then((result?: Member[]) => {
        result && setFilterMembers(result)
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

  const onClickTransferOwnership = (userId: string) => {
    dispatch(transferOwnershipMemberRole({ organizationId, userId }))
      .unwrap()
      .then(() => fetchMembersDispatch())
  }

  return (
    <PageOrganizationMembers
      userId={user.sub}
      members={!loadingMembers ? organization?.members?.items : membersDataMock}
      filterMembers={filterMembers}
      setFilterMembers={setFilterMembers}
      loadingMembers={loadingMembers}
      inviteMembers={organization?.inviteMembers?.items}
      availableRoles={organization?.availableRoles?.items}
      loadingUpdateRole={loadingUpdateRole}
      editMemberRole={onClickEditMemberRole}
      transferOwnership={onClickTransferOwnership}
      deleteMember={onClickDeleteMember}
    />
  )
}

export default PageOrganizationMembersFeature
