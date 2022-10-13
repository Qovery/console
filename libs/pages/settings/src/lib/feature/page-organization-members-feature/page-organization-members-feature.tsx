import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  editMemberRole,
  fetchAvailableRoles,
  fetchInviteMembers,
  fetchMembers,
  selectOrganizationById,
} from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationMembers from '../../ui/page-organization-members/page-organization-members'

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

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (organization && membersLoadingStatus !== 'loaded') {
      dispatch(fetchMembers({ organizationId }))
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

    dispatch(editMemberRole({ organizationId, data }))
      .unwrap()
      .catch((e) => {
        console.error(e)
      })
  }

  return (
    <PageOrganizationMembers
      members={organization?.members?.items}
      inviteMembers={organization?.inviteMembers?.items}
      availableRoles={organization?.availableRoles?.items}
      editMemberRole={onClickEditMemberRole}
    />
  )
}

export default PageOrganizationMembersFeature
