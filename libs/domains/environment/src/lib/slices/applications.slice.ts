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
  joinEnvApp: Record<string, string[]>
}

export const applicationsAdapter = createEntityAdapter<Application>()

const applicationsApi = new ApplicationsApi()

export const fetchApplications = createAsyncThunk<any, { environmentId: string }>(
  'applications/fetch',
  async (data, thunkApi) => {
    const response = await applicationsApi.listApplication(data.environmentId).then((response) => {
      return response.data
    })
    return response.results as Application[]
  }
)

export const initialApplicationsState: ApplicationsState = applicationsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinEnvApp: {},
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
        applicationsAdapter.upsertMany(state, action.payload)
        action.payload.map((app) => {
          if (app.environment) {
            if (state.joinEnvApp[app.environment?.id]) state.joinEnvApp[app.environment?.id].push(app.id)
            else state.joinEnvApp[app.environment?.id] = [app.id]
          }
        })
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

const { selectAll, selectEntities, selectById } = applicationsAdapter.getSelectors()

export const getApplicationsState = (rootState: any): ApplicationsState => rootState[APPLICATIONS_FEATURE_KEY]

export const selectAllApplications = createSelector(getApplicationsState, selectAll)
export const selectAllApplicationsByEnv = (environmentId: string) => createSelector(getApplicationsState, selectAll)

export const selectApplicationsEntities = createSelector(getApplicationsState, selectEntities)

export const selectApplicationsEntitiesByEnvId = (environmentId: string) =>
  createSelector(getApplicationsState, (state): Application[] => {
    const applications: Application[] = []

    if (state?.joinEnvApp[environmentId]) {
      state.joinEnvApp[environmentId].forEach((id) => {
        applications.push(state.entities[id] as Application)
      })
    }

    return applications
  })
