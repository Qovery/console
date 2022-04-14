import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { Organization, OrganizationMainCallsApi, OrganizationRequest } from 'qovery-typescript-axios'

export const ORGANIZATION_KEY = 'organization'

const organizationMainCalls = new OrganizationMainCallsApi()

export interface OrganizationState extends EntityState<Organization> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}

export const organizationAdapter = createEntityAdapter<Organization>()

export const fetchOrganization = createAsyncThunk('organization/fetch', async () => {
  const response = await organizationMainCalls.listOrganization().then((response) => response.data)
  return response.results as Organization[]
})

export const postOrganization = createAsyncThunk<any, OrganizationRequest>(
  'organization/post',
  async (data: OrganizationRequest, { rejectWithValue }) => {
    try {
      const result = await organizationMainCalls.createOrganization(data).then((response) => response.data)
      return result
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

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
      .addCase(fetchOrganization.fulfilled, (state: OrganizationState, action: PayloadAction<Organization[]>) => {
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
      .addCase(postOrganization.fulfilled, (state: OrganizationState, action: PayloadAction<Organization>) => {
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

export const getOrganizationState = (rootState: any): OrganizationState => rootState[ORGANIZATION_KEY]

export const selectAllOrganization = createSelector(getOrganizationState, selectAll)

export const selectOrganizationLoadingStatus = createSelector(getOrganizationState, (state) => state.loadingStatus)
