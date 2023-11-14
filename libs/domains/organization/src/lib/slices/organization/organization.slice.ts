import {
  type PayloadAction,
  type Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
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
