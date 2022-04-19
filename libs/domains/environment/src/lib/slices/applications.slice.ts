import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { ApplicationsApi, Application } from 'qovery-typescript-axios'

export const APPLICATIONS_FEATURE_KEY = 'applications'

export interface ApplicationsState extends EntityState<Application> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}

export const applicationsAdapter = createEntityAdapter<Application>()

const applicationsApi = new ApplicationsApi()

export const fetchApplications = createAsyncThunk<any, { environmentId: string }>(
  'applications/fetch',
  async (data) => {
    const response = await applicationsApi.listApplication(data.environmentId).then((response) => response.data)
    return response.results as Application[]
  }
)

export const initialApplicationsState: ApplicationsState = applicationsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
})

export const applicationsSlice = createSlice({
  name: APPLICATIONS_FEATURE_KEY,
  initialState: initialApplicationsState,
  reducers: {
    add: applicationsAdapter.addOne,
    remove: applicationsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state: ApplicationsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchApplications.fulfilled, (state: ApplicationsState, action: PayloadAction<Application[]>) => {
        applicationsAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchApplications.rejected, (state: ApplicationsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const applications = applicationsSlice.reducer

export const applicationsActions = applicationsSlice.actions

const { selectAll, selectEntities } = applicationsAdapter.getSelectors()

export const getApplicationsState = (rootState: any): ApplicationsState => rootState[APPLICATIONS_FEATURE_KEY]

export const selectAllApplications = createSelector(getApplicationsState, selectAll)

export const selectApplicationsEntities = createSelector(getApplicationsState, selectEntities)
