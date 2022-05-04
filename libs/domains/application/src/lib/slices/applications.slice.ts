import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { ApplicationsApi, Application, ApplicationMainCallsApi } from 'qovery-typescript-axios'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from '@console/shared/utils'

export const APPLICATIONS_FEATURE_KEY = 'applications'

export interface ApplicationsState extends EntityState<Application> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinEnvApp: Record<string, string[]>
}

export const applicationsAdapter = createEntityAdapter<Application>()

const applicationsApi = new ApplicationsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()

export const fetchApplications = createAsyncThunk<any, { environmentId: string }>(
  'applications/fetch',
  async (data) => {
    const response = await applicationsApi.listApplication(data.environmentId).then((response) => {
      return response.data
    })
    return response.results as Application[]
  }
)

export const fetchApplication = createAsyncThunk<any, { applicationId: string }>('application/fetch', async (data) => {
  const response = await applicationMainCallsApi.getApplication(data.applicationId).then((response) => response.data)
  return response as Application
})

export const removeOneApplication = createAsyncThunk<any, { applicationId: string }>(
  'applications/remove',
  async (data, thunkApi) => {
    // const response = await applicationMainCallsApi.getApplication(data.applicationId).then((response) => {
    //   return response.data
    // })

    return data.applicationId
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
        action.payload.forEach((app) => {
          state.joinEnvApp = addOneToManyRelation(app.environment?.id, app.id, { ...state.joinEnvApp })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchApplications.rejected, (state: ApplicationsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      .addCase(fetchApplication.pending, (state: ApplicationsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchApplication.fulfilled, (state: ApplicationsState, action: PayloadAction<Application>) => {
        applicationsAdapter.upsertOne(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchApplication.rejected, (state: ApplicationsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // remove application
      .addCase(removeOneApplication.fulfilled, (state: ApplicationsState, action: PayloadAction<string>) => {
        state.joinEnvApp = removeOneToManyRelation(action.payload, state.joinEnvApp)
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
    return getEntitiesByIds<Application>(state.entities, state?.joinEnvApp[environmentId])
  })

export const selectApplicationById = (applicationId: string) =>
  createSelector(getApplicationsState, (state) => selectById(state, applicationId))
