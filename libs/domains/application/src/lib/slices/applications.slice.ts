import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit'
import {
  Application,
  ApplicationMainCallsApi,
  ApplicationMetricsApi,
  ApplicationsApi,
  Commit,
  Instance,
  Link,
  Status,
} from 'qovery-typescript-axios'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from '@console/shared/utils'
import { ApplicationEntity, ApplicationsState, LoadingStatus } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'

export const APPLICATIONS_FEATURE_KEY = 'applications'

export const applicationsAdapter = createEntityAdapter<ApplicationEntity>()

const applicationsApi = new ApplicationsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()
const applicationMetricsApi = new ApplicationMetricsApi()

export const fetchApplications = createAsyncThunk<Application[], { environmentId: string; withoutStatus?: boolean }>(
  'applications/fetch',
  async (data, thunkApi) => {
    const response = await applicationsApi.listApplication(data.environmentId)

    if (!data.withoutStatus) {
      thunkApi.dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
    }

    return response.data.results as Application[]
  }
)

export const fetchApplicationsStatus = createAsyncThunk<Status[], { environmentId: string }>(
  'applications-status/fetch',
  async (data) => {
    const response = await applicationsApi.getEnvironmentApplicationStatus(data.environmentId)
    return response.data.results as Status[]
  }
)

export const fetchApplication = createAsyncThunk<Application, { applicationId: string }>(
  'application/fetch',
  async (data) => {
    const response = await applicationMainCallsApi.getApplication(data.applicationId)
    return response.data as Application
  }
)

export const removeOneApplication = createAsyncThunk<string, { applicationId: string }>(
  'applications/remove',
  async (data, thunkApi) => {
    // const response = await applicationMainCallsApi.getApplication(data.applicationId)
    return data.applicationId
  }
)

export const fetchApplicationLinks = createAsyncThunk<Link[], { applicationId: string }>(
  'application/links',
  async (data) => {
    const response = await applicationMainCallsApi.listApplicationLinks(data.applicationId)
    return response.data.results as Link[]
  }
)

export const fetchApplicationInstances = createAsyncThunk<Instance[], { applicationId: string }>(
  'application/instances',
  async (data) => {
    const response = await applicationMetricsApi.getApplicationCurrentInstance(data.applicationId)
    return response.data.results as Instance[]
  }
)

export const fetchApplicationCommits = createAsyncThunk<Commit[], { applicationId: string }>(
  'application/commits',
  async (data) => {
    const response = await applicationMainCallsApi.listApplicationCommit(data.applicationId)
    return response.data.results as Commit[]
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
      .addCase(fetchApplicationLinks.pending, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            links: {
              ...state.entities[applicationId]?.links,
              loadingStatus: 'loading',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationLinks.fulfilled, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            links: {
              items: action.payload,
              loadingStatus: 'loaded',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationInstances.pending, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            instances: {
              ...state.entities[applicationId]?.instances,
              loadingStatus: 'loading',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationInstances.fulfilled, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            instances: {
              items: action.payload,
              loadingStatus: 'loaded',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationInstances.rejected, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            instances: {
              loadingStatus: 'error',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationCommits.pending, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            commits: {
              ...state.entities[applicationId]?.commits,
              loadingStatus: 'loading',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationCommits.fulfilled, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            commits: {
              items: action.payload,
              loadingStatus: 'loaded',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationCommits.rejected, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            commits: {
              loadingStatus: 'error',
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
  },
})

export const applications = applicationsSlice.reducer

export const applicationsActions = applicationsSlice.actions

const { selectAll, selectEntities, selectById } = applicationsAdapter.getSelectors()

export const getApplicationsState = (rootState: RootState): ApplicationsState =>
  rootState['entities'][APPLICATIONS_FEATURE_KEY]

export const selectAllApplications = createSelector(getApplicationsState, selectAll)
export const selectAllApplicationsByEnv = (environmentId: string) => createSelector(getApplicationsState, selectAll)

export const selectApplicationsEntities = createSelector(getApplicationsState, selectEntities)

export const selectApplicationsEntitiesByEnvId = (state: RootState, environmentId: string): ApplicationEntity[] => {
  const appState = getApplicationsState(state)
  return getEntitiesByIds<Application>(appState.entities, appState?.joinEnvApp[environmentId])
}

export const selectApplicationById = (state: RootState, applicationId: string): ApplicationEntity | undefined =>
  getApplicationsState(state).entities[applicationId]

export const applicationsLoadingStatus = (state: RootState): LoadingStatus => getApplicationsState(state).loadingStatus

export const getCountNewCommitsToDeploy = (applicationId: string) =>
  createSelector(
    (state: RootState) => {
      return selectById(getApplicationsState(state), applicationId)
    },
    (application): number => {
      const deployedCommit = application?.git_repository?.deployed_commit_id
      let delta = 0
      if (!deployedCommit) return delta
      if (!application.commits?.items) return delta

      for (const commit of application.commits.items) {
        if (commit.git_commit_id === deployedCommit) break
        delta++
      }

      return delta
    }
  )
