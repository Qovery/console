import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { EnvironmentsApi, Environment } from 'qovery-typescript-axios'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environementsApi = new EnvironmentsApi()

export interface EnvironmentsState extends EntityState<Environment> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}

export const environmentsAdapter = createEntityAdapter<Environment>()

export const fetchEnvironments = createAsyncThunk<any, { projectId: string }>('environments/fetch', async (data) => {
  const response = await environementsApi.listEnvironment(data.projectId).then((response) => response.data)
  return response.results as Environment[]
})

export const initialEnvironmentsState: EnvironmentsState = environmentsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
})

export const environmentsSlice = createSlice({
  name: ENVIRONMENTS_FEATURE_KEY,
  initialState: initialEnvironmentsState,
  reducers: {
    add: environmentsAdapter.addOne,
    remove: environmentsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnvironments.pending, (state: EnvironmentsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchEnvironments.fulfilled, (state: EnvironmentsState, action: PayloadAction<Environment[]>) => {
        environmentsAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchEnvironments.rejected, (state: EnvironmentsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const environments = environmentsSlice.reducer

export const environmentsActions = environmentsSlice.actions

const { selectAll, selectEntities } = environmentsAdapter.getSelectors()

export const getEnvironmentsState = (rootState: any): EnvironmentsState => rootState[ENVIRONMENTS_FEATURE_KEY]

export const selectAllEnvironments = createSelector(getEnvironmentsState, selectAll)

export const selectEnvironmentsEntities = createSelector(getEnvironmentsState, selectEntities)
