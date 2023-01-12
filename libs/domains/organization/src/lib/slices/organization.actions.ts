import { createAsyncThunk } from '@reduxjs/toolkit'
import { MemberRoleUpdateRequest, MembersApi } from 'qovery-typescript-axios'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { fetchMembers } from './organization.slice'

const membersApi = new MembersApi()

export const editMemberRole = createAsyncThunk(
  'organization/edit-member-role',
  async (payload: { organizationId: string; data: MemberRoleUpdateRequest }, { dispatch }) => {
    // edit organization  member role
    try {
      const result = await membersApi.editOrganizationMemberRole(payload.organizationId, payload.data)
      if (result.status === 200) {
        // refetch member to update members list, we can't update with the edit response
        await dispatch(fetchMembers({ organizationId: payload.organizationId }))

        toast(
          ToastEnum.SUCCESS,
          'Member role updated',
          'Target user needs to relog or wait a few minutes to make it work.'
        )
      }

      return result
    } catch (err: any) {
      // error message
      return toast(ToastEnum.ERROR, 'Member role error', err.message)
    }
  }
)

export const transferOwnershipMemberRole = createAsyncThunk(
  'organization/transfer-ownership-member',
  async (payload: { organizationId: string; userId: string }) => {
    // transfer ownership for member
    try {
      const result = await membersApi.postOrganizationTransferOwnership(payload.organizationId, {
        user_id: payload.userId,
      })
      if (result.status === 200) toast(ToastEnum.SUCCESS, 'Ownership transferred successfully')
      return result
    } catch (err: any) {
      // error message
      return toast(ToastEnum.ERROR, 'Ownership transfer error', err.message)
    }
  }
)
