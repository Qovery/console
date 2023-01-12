import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { MembersApi } from 'qovery-typescript-axios'
import { ProjectsState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'
import { UserInterface } from '../interfaces'

export const USER_KEY = 'user'

const membersApi = new MembersApi()

export const acceptMembershipInvitation = createAsyncThunk(
  'user/accept-membership-invitation',
  async (payload: { organizationId: string; inviteId: string }) => {
    // transfer ownership for member
    return await membersApi.postAcceptInviteMember(payload.organizationId, payload.inviteId, {})
  }
)

export const fetchMemberInvitation = createAsyncThunk(
  'user/get-membership-invitation',
  async (payload: { organizationId: string; inviteId: string }) => {
    // transfer ownership for member
    return await membersApi.getMemberInvitation(payload.organizationId, payload.inviteId)
  }
)

export const initialUserState: UserInterface = {
  isLoading: false,
  isAuthenticated: false,
  token: null,
}

export const userSlice = createSlice({
  name: USER_KEY,
  initialState: initialUserState,
  reducers: {
    add(state, action) {
      return action.payload
    },
    remove() {
      return initialUserState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(acceptMembershipInvitation.fulfilled, (state: ProjectsState) => {
        toast(ToastEnum.SUCCESS, 'Invitation Accepted')
      })
      .addCase(acceptMembershipInvitation.rejected, (state: ProjectsState, action) => {
        return toast(
          ToastEnum.ERROR,
          'Invitation Member',
          'The invitation can not be accepted. ' + action.error.message
        )
      })
      .addCase(fetchMemberInvitation.rejected, (state: ProjectsState, action) => {
        toastError(action.error, 'Invitation Member', 'This member invitation is not correct')
      })
  },
})

export const user = userSlice.reducer

export const userActions = userSlice.actions

export const getUserState = (rootState: RootState): UserInterface => rootState[USER_KEY]

export const selectUser = createSelector(getUserState, (state) => state)
