import { Member } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editMemberRole,
  fetchAvailableRoles,
  fetchInviteMembers,
  fetchMembers,
  membersMock,
  selectOrganizationById,
} from '@qovery/domains/organization'
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

  const dispatch = useDispatch<AppDispatch>()

  const [filterMembers, setFilterMembers] = useState<Member[]>(organization?.members?.items || membersMock(5))

  useEffect(() => {
    if (membersLoadingStatus !== 'loaded') setLoadingMembers(true)

    if (organization && membersLoadingStatus !== 'loaded') {
      dispatch(fetchMembers({ organizationId }))
        .unwrap()
        .then((result?: Member[]) => {
          result && setFilterMembers(result)
          setLoadingMembers(false)
        })
        .catch((e) => console.error(e))
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
    membersLoadingStatus,
    inviteMembersLoadingStatus,
    availableRolesLoadingStatus,
  ])

  const onClickEditMemberRole = (userId: string, roleId: string) => {
    const data = { user_id: userId, role_id: roleId }
    setLoadingUpdateRole({ userId, loading: true })

    dispatch(editMemberRole({ organizationId, data }))
      .unwrap()
      .then(() => setLoadingUpdateRole({ userId, loading: false }))
      .catch((e) => console.error(e))
  }

  return (
    <PageOrganizationMembers
      members={!loadingMembers ? organization?.members?.items : membersDataMock}
      filterMembers={filterMembers}
      setFilterMembers={setFilterMembers}
      loadingMembers={loadingMembers}
      inviteMembers={organization?.inviteMembers?.items}
      availableRoles={organization?.availableRoles?.items}
      loadingUpdateRole={loadingUpdateRole}
      editMemberRole={onClickEditMemberRole}
    />
  )
}

export default PageOrganizationMembersFeature
