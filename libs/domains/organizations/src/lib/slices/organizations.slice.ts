import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import axios from 'axios'
import { OrganizationInterface } from '../interfaces/organizations.interface'

export const ORGANIZATIONS_KEY = 'organizations'

export interface OrganizationsState extends EntityState<OrganizationInterface> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error'
  error: string | null | undefined
}

export const organizationsAdapter = createEntityAdapter<OrganizationInterface>()

export const fetchOrganizations = createAsyncThunk('organization/fetch', async () => {
  const response = await axios.get('/organization').then((response) => response.data)

  return response.results
})

export const initialOrganizationState: OrganizationsState = organizationsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
})

export const organizationsSlice = createSlice({
  name: ORGANIZATIONS_KEY,
  initialState: initialOrganizationState,
  reducers: {
    addOrganizations: organizationsAdapter.addOne,
    removeOrganizations: organizationsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state: OrganizationsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(
        fetchOrganizations.fulfilled,
        (state: OrganizationsState, action: PayloadAction<OrganizationInterface[]>) => {
          organizationsAdapter.setAll(state, action.payload)

          state.loadingStatus = 'loaded'
        }
      )
      .addCase(fetchOrganizations.rejected, (state: OrganizationsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const organizations = organizationsSlice.reducer

export const { addOrganizations, removeOrganizations } = organizationsSlice.actions

const { selectAll } = organizationsAdapter.getSelectors()

export const getOrganizationsState = (rootState: any): OrganizationsState => rootState[ORGANIZATIONS_KEY]

export const selectAllOrganizations = createSelector(getOrganizationsState, selectAll)

export const selectOrganizationsLoadingStatus = createSelector(getOrganizationsState, (state) => state.loadingStatus)
