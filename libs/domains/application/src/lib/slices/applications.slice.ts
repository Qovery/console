import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit'
import { Application, ApplicationMainCallsApi, ApplicationsApi, Status } from 'qovery-typescript-axios'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from '@console/shared/utils'
import { ApplicationEntity, ApplicationsState, RootState } from '@console/shared/interfaces'

export const APPLICATIONS_FEATURE_KEY = 'applications'

export const applicationsAdapter = createEntityAdapter<ApplicationEntity>()

const applicationsApi = new ApplicationsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()

export const fetchApplications = createAsyncThunk<Application[], { environmentId: string }>(
  'applications/fetch',
  async (data) => {
    const response = await applicationsApi.listApplication(data.environmentId).then((response) => {
      return response.data
    })
    return response.results as Application[]
  }
)

export const fetchApplicationsStatus = createAsyncThunk<Status[], { environmentId: string }>(
  'applications-status/fetch',
  async (data) => {
    const response = await applicationsApi
      .getEnvironmentApplicationStatus(data.environmentId)
      .then((response: any) => response.data)
    return response.results as Status[]
  }
)

export const fetchApplication = createAsyncThunk<Application, { applicationId: string }>(
  'application/fetch',
  async (data) => {
    const response = await applicationMainCallsApi.getApplication(data.applicationId).then((response) => response.data)
    return response as Application
  }
)

export const removeOneApplication = createAsyncThunk<string, { applicationId: string }>(
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
      // get environments status
      .addCase(fetchApplicationsStatus.pending, (state: ApplicationsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchApplicationsStatus.fulfilled, (state: ApplicationsState, action: PayloadAction<Status[]>) => {
        const update: { id: string | undefined; changes: { status: Status } }[] = action.payload.map(
          (status: Status) => ({
            id: status.id,
            changes: {
              status: status,
            },
          })
        )
        applicationsAdapter.updateMany(state, update as Update<Application>[])
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchApplicationsStatus.rejected, (state: ApplicationsState, action) => {
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

const { selectAll, selectEntities } = applicationsAdapter.getSelectors()

export const getApplicationsState = (rootState: RootState): ApplicationsState => rootState[APPLICATIONS_FEATURE_KEY]

export const selectAllApplications = createSelector(getApplicationsState, selectAll)
export const selectAllApplicationsByEnv = (environmentId: string) => createSelector(getApplicationsState, selectAll)

export const selectApplicationsEntities = createSelector(getApplicationsState, selectEntities)

export const selectApplicationsEntitiesByEnvId = (state: RootState, environmentId: string): ApplicationEntity[] => {
  const appState = getApplicationsState(state)
  return getEntitiesByIds<Application>(appState.entities, appState?.joinEnvApp[environmentId])
}

export const selectApplicationById = (state: RootState, applicationId: string): ApplicationEntity | undefined =>
  getApplicationsState(state).entities[applicationId]
