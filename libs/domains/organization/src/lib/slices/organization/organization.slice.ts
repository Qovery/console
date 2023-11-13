import {
  type PayloadAction,
  type Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
  type InviteMember,
  type InviteMemberRequest,
  MembersApi,
  type OrganizationEditRequest,
  OrganizationMainCallsApi,
  type OrganizationRequest,
} from 'qovery-typescript-axios'
import { type OrganizationEntity, type OrganizationState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { refactoOrganizationPayload } from '@qovery/shared/util-js'
import { type RootState } from '@qovery/state/store'

export const ORGANIZATION_KEY = 'organizations'

const organizationMainCalls = new OrganizationMainCallsApi()
const membersApi = new MembersApi()

export const organizationAdapter = createEntityAdapter<OrganizationEntity>()

export const fetchOrganization = createAsyncThunk('organization/fetch', async () => {
  const response = await organizationMainCalls.listOrganization()

  return response.data.results as OrganizationEntity[]
})

export const fetchOrganizationById = createAsyncThunk(
  'organization/fetch-by-id',
  async (payload: { organizationId: string }) => {
    const response = await organizationMainCalls.getOrganization(payload.organizationId)

    return response.data as OrganizationEntity
  }
)

export const postOrganization = createAsyncThunk<OrganizationEntity, OrganizationRequest>(
  'organization/post',
  async (data: OrganizationRequest) => {
    const result = await organizationMainCalls.createOrganization(data)
    return result.data
  }
)

export const editOrganization = createAsyncThunk(
  'organization/edit',
  async (payload: { organizationId: string; data: Partial<OrganizationEntity> }) => {
    const cloneOrganization = Object.assign({}, refactoOrganizationPayload(payload.data))
    const response = await organizationMainCalls.editOrganization(
      payload.organizationId,
      cloneOrganization as OrganizationEditRequest
    )

    return response.data as OrganizationEntity
  }
)
export const deleteOrganization = createAsyncThunk(
  'organization/delete',
  async (payload: { organizationId: string }) => {
    return await organizationMainCalls.deleteOrganization(payload.organizationId)
  }
)

export const fetchMembers = createAsyncThunk('organization/members', async (payload: { organizationId: string }) => {
  // fetch organization members
  const result = await membersApi.getOrganizationMembers(payload.organizationId)
  return result.data.results
})

export const fetchInviteMembers = createAsyncThunk(
  'organization/inviteMembers',
  async (payload: { organizationId: string }) => {
    // fetch organization invite members
    const result = await membersApi.getOrganizationInvitedMembers(payload.organizationId)
    return result.data.results
  }
)

export const deleteInviteMember = createAsyncThunk(
  'organization/delete-invite-member',
  async (payload: { organizationId: string; inviteId: string; silentToaster?: boolean }) => {
    // delete invite member by user id
    await membersApi.deleteInviteMember(payload.organizationId, payload.inviteId)
  }
)

export const deleteMember = createAsyncThunk(
  'organization/member-delete',
  async (payload: { organizationId: string; userId: string }) => {
    // delete member by user id
    await membersApi.deleteMember(payload.organizationId, { user_id: payload.userId })
  }
)

export const postInviteMember = createAsyncThunk(
  'organization/invite-member',
  async (payload: { organizationId: string; data: InviteMemberRequest; silentToaster?: boolean }) => {
    // post invite member
    const result = await membersApi.postInviteMember(payload.organizationId, payload.data)
    return result.data as InviteMember
  }
)

export const initialOrganizationState: OrganizationState = organizationAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  availableContainerRegistries: {
    loadingStatus: 'not loaded',
    items: [],
  },
})

export const organizationSlice = createSlice({
  name: ORGANIZATION_KEY,
  initialState: initialOrganizationState,
  reducers: {
    addOrganization: organizationAdapter.addOne,
    removeOrganization: organizationAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchOrganization.fulfilled, (state: OrganizationState, action: PayloadAction<OrganizationEntity[]>) => {
        organizationAdapter.upsertMany(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // fetch organization by id
      .addCase(
        fetchOrganizationById.fulfilled,
        (state: OrganizationState, action: PayloadAction<OrganizationEntity>) => {
          organizationAdapter.upsertOne(state, action.payload)
          state.loadingStatus = 'loaded'
        }
      )
      // post organization
      .addCase(postOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postOrganization.fulfilled, (state: OrganizationState, action: PayloadAction<OrganizationEntity>) => {
        organizationAdapter.addOne(state, action.payload)
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Your organization has been created')
      })
      .addCase(postOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
      // delete organization
      .addCase(deleteOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(deleteOrganization.fulfilled, (state: OrganizationState, action) => {
        organizationAdapter.removeOne(state, action.meta.arg.organizationId)
        state.loadingStatus = 'loaded'
        state.error = null
        toast(ToastEnum.SUCCESS, `Your organization has been deleted`)
      })
      .addCase(deleteOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
      // edit organization
      .addCase(editOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editOrganization.fulfilled, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            ...action.payload,
          },
        }
        organizationAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Organization updated')
      })
      .addCase(editOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // fetch organization members
      .addCase(fetchMembers.pending, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            members: {
              loadingStatus: 'loaded',
              items: state.entities[action.meta.arg.organizationId]?.members?.items || [],
            },
          },
        }

        organizationAdapter.updateOne(state, update)
      })
      .addCase(fetchMembers.fulfilled, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            members: {
              loadingStatus: 'loaded',
              items: action.payload,
            },
          },
        }

        organizationAdapter.updateOne(state, update)
      })
      // fetch organization invite members
      .addCase(fetchInviteMembers.pending, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            inviteMembers: {
              loadingStatus: 'loaded',
              items: state.entities[action.meta.arg.organizationId]?.inviteMembers?.items || [],
            },
          },
        }

        organizationAdapter.updateOne(state, update)
      })
      .addCase(fetchInviteMembers.fulfilled, (state: OrganizationState, action) => {
        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            inviteMembers: {
              loadingStatus: 'loaded',
              items: action.payload,
            },
          },
        }

        organizationAdapter.updateOne(state, update)
      })
      // delete member
      .addCase(deleteMember.fulfilled, (state: OrganizationState, action) => {
        const members = state.entities[action.meta.arg.organizationId]?.members?.items || []

        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            members: {
              loadingStatus: 'loaded',
              items: members.filter((member) => member.id !== action.meta.arg.userId),
            },
          },
        }
        organizationAdapter.updateOne(state, update)
        toast(ToastEnum.SUCCESS, `Member removed`)
      })
      .addCase(deleteMember.rejected, (state: OrganizationState, action) => {
        toastError(action.error)
      })
      // delete invite member
      .addCase(deleteInviteMember.fulfilled, (state: OrganizationState, action) => {
        const inviteMembers = state.entities[action.meta.arg.organizationId]?.inviteMembers?.items || []

        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            inviteMembers: {
              loadingStatus: 'loaded',
              items: inviteMembers.filter((member) => member.id !== action.meta.arg.inviteId),
            },
          },
        }
        organizationAdapter.updateOne(state, update)
        if (!action.meta.arg.silentToaster) toast(ToastEnum.SUCCESS, 'Invite member removed')
      })
      .addCase(deleteInviteMember.rejected, (state: OrganizationState, action) => {
        toastError(action.error)
      })
      // post invite member
      .addCase(postInviteMember.fulfilled, (state: OrganizationState, action) => {
        const inviteMembers = state.entities[action.meta.arg.organizationId]?.inviteMembers?.items || []

        const update: Update<OrganizationEntity> = {
          id: action.meta.arg.organizationId,
          changes: {
            inviteMembers: {
              loadingStatus: 'loaded',
              items: [action.payload, ...inviteMembers],
            },
          },
        }
        organizationAdapter.updateOne(state, update)
        if (!action.meta.arg.silentToaster) toast(ToastEnum.SUCCESS, 'Invite member added')
      })
      .addCase(postInviteMember.rejected, (state: OrganizationState, action) => {
        toastError(action.error)
      })
  },
})

export const organization = organizationSlice.reducer

export const { addOrganization, removeOrganization } = organizationSlice.actions

const { selectAll } = organizationAdapter.getSelectors()

export const getOrganizationState = (rootState: RootState): OrganizationState =>
  rootState.organization[ORGANIZATION_KEY]

export const selectAllOrganization = createSelector(getOrganizationState, selectAll)

export const selectOrganizationById = (state: RootState, organizationId: string) =>
  getOrganizationState(state).entities[organizationId]

export const selectOrganizationLoadingStatus = createSelector(getOrganizationState, (state) => state.loadingStatus)
