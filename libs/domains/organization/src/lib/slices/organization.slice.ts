import { PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { Organization, OrganizationMainCallsApi, OrganizationRequest } from 'qovery-typescript-axios'
import { OrganizationEntity, OrganizationState } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'

export const ORGANIZATION_KEY = 'organizations'

const organizationMainCalls = new OrganizationMainCallsApi()
//const containerRegistriesApi = new ContainerRegistriesApi()

export const organizationAdapter = createEntityAdapter<OrganizationEntity>()

export const fetchOrganization = createAsyncThunk('organization/fetch', async () => {
  const response = await organizationMainCalls.listOrganization()

  return response.data.results as Organization[]
})

export const postOrganization = createAsyncThunk<OrganizationEntity, OrganizationRequest>(
  'organization/post',
  async (data: OrganizationRequest, { rejectWithValue }) => {
    try {
      const result = await organizationMainCalls.createOrganization(data)
      return result.data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

// export const fetchContainerRegistries = createAsyncThunk<ContainerRegistryResponse, {organizationId: string}>(
//   'organization/containerRegistries/fetch',
//   async (data) => {
//     const result = await containerRegistriesApi.listContainerRegistry(data.organizationId)
//     return result.data
//   }
// )

export const initialOrganizationState: OrganizationState = organizationAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
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
        organizationAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // post action
      .addCase(postOrganization.pending, (state: OrganizationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postOrganization.fulfilled, (state: OrganizationState, action: PayloadAction<OrganizationEntity>) => {
        organizationAdapter.setOne(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(postOrganization.rejected, (state: OrganizationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const organization = organizationSlice.reducer

export const { addOrganization, removeOrganization } = organizationSlice.actions

const { selectAll } = organizationAdapter.getSelectors()

export const getOrganizationState = (rootState: RootState): OrganizationState =>
  rootState.entities.organization[ORGANIZATION_KEY]

export const selectAllOrganization = createSelector(getOrganizationState, selectAll)

export const selectOrganizationById = (state: RootState, organizationId: string) =>
  getOrganizationState(state).entities[organizationId]

export const selectOrganizationLoadingStatus = createSelector(getOrganizationState, (state) => state.loadingStatus)
