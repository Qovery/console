import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
  Application,
  ApplicationDeploymentHistoryApi,
  ApplicationMainCallsApi,
  ApplicationMetricsApi,
  ApplicationsApi,
  Commit,
  DeploymentHistoryApplication,
  Instance,
  Link,
  Status,
} from 'qovery-typescript-axios'
import { ApplicationEntity, ApplicationsState, LoadingStatus, ServiceRunningStatus } from '@console/shared/interfaces'
import { ToastEnum, toast, toastError } from '@console/shared/toast'
import {
  addOneToManyRelation,
  getEntitiesByIds,
  refactoApplicationPayload,
  removeOneToManyRelation,
  shortToLongId,
} from '@console/shared/utils'
import { RootState } from '@console/store/data'

export const APPLICATIONS_FEATURE_KEY = 'applications'

export const applicationsAdapter = createEntityAdapter<ApplicationEntity>()

const applicationsApi = new ApplicationsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()
const applicationDeploymentsApi = new ApplicationDeploymentHistoryApi()
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

export const editApplication = createAsyncThunk(
  'application/edit',
  async (payload: { applicationId: string; data: Application }) => {
    const cloneApplication = Object.assign({}, refactoApplicationPayload(payload.data) as any)

    const response = await applicationMainCallsApi.editApplication(payload.applicationId, cloneApplication)
    return response.data as Application
  }
)

export const removeOneApplication = createAsyncThunk<string, { applicationId: string }>(
  'applications/remove',
  async (data) => {
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

export const fetchApplicationDeployments = createAsyncThunk<
  DeploymentHistoryApplication[],
  { applicationId: string; silently?: boolean }
>('application/deployments', async (data) => {
  const response = await applicationDeploymentsApi.listApplicationDeploymentHistory(data.applicationId)
  return response.data.results as DeploymentHistoryApplication[]
})

export const fetchApplicationStatus = createAsyncThunk<Status, { applicationId: string }>(
  'application/status',
  async (data) => {
    const response = await applicationMainCallsApi.getApplicationStatus(data.applicationId)
    return response.data as Status
  }
)

export const initialApplicationsState: ApplicationsState = applicationsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinEnvApplication: {},
  statusLoadingStatus: 'not loaded',
})

export const applicationsSlice = createSlice({
  name: APPLICATIONS_FEATURE_KEY,
  initialState: initialApplicationsState,
  reducers: {
    add: applicationsAdapter.addOne,
    remove: applicationsAdapter.removeOne,
    updateApplicationsRunningStatus: (
      state,
      action: PayloadAction<{ servicesRunningStatus: ServiceRunningStatus[]; listEnvironmentIdFromCluster: string[] }>
    ) => {
      // we have to force this reset change because of the way the socket works.
      // You can have information about an application (eg. if it's stopping)
      // But you can also lose the information about this application (eg. it it's stopped it won't appear in the socket result)
      const resetChanges: Update<ApplicationEntity>[] = state.ids.map((id) => {
        // as we can have this dispatch from different websocket, we don't want to reset
        // and override all the application but only the ones associated to the cluster the websocket is
        // coming from, more generally from all the environments that are contained in this cluster
        const envId = state.entities[id]?.environment?.id

        const runningStatusChanges =
          envId && action.payload.listEnvironmentIdFromCluster.includes(envId)
            ? undefined
            : state.entities[id]?.running_status
        return {
          id,
          changes: {
            running_status: runningStatusChanges,
          },
        }
      })
      applicationsAdapter.updateMany(state, resetChanges)

      const changes: Update<ApplicationEntity>[] = action.payload.servicesRunningStatus.map((runningStatus) => {
        const realId = shortToLongId(runningStatus.id, state.ids as string[])
        return {
          id: realId,
          changes: {
            running_status: runningStatus,
          },
        }
      })

      applicationsAdapter.updateMany(state, changes)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state: ApplicationsState) => {
        state.loadingStatus = 'loading'
      })
      // fetch applications
      .addCase(fetchApplications.fulfilled, (state: ApplicationsState, action: PayloadAction<Application[]>) => {
        applicationsAdapter.upsertMany(state, action.payload)
        action.payload.forEach((app) => {
          state.joinEnvApplication = addOneToManyRelation(app.environment?.id, app.id, { ...state.joinEnvApplication })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchApplications.rejected, (state: ApplicationsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // fetch application
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
      // edit application
      .addCase(editApplication.pending, (state: ApplicationsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editApplication.fulfilled, (state: ApplicationsState, action) => {
        const update: Update<Application> = {
          id: action.meta.arg.applicationId,
          changes: {
            ...action.payload,
          },
        }
        applicationsAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, `Your application ${action.payload.name} has been updated`)
      })
      .addCase(editApplication.rejected, (state: ApplicationsState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // get applications status
      .addCase(fetchApplicationsStatus.pending, (state: ApplicationsState) => {
        state.statusLoadingStatus = 'loading'
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
        state.statusLoadingStatus = 'loaded'
      })
      .addCase(fetchApplicationsStatus.rejected, (state: ApplicationsState, action) => {
        state.statusLoadingStatus = 'error'
        state.error = action.error.message
      })
      // remove application
      .addCase(removeOneApplication.fulfilled, (state: ApplicationsState, action: PayloadAction<string>) => {
        state.joinEnvApplication = removeOneToManyRelation(action.payload, state.joinEnvApplication)
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
      // get application deployment history
      .addCase(fetchApplicationDeployments.pending, (state: ApplicationsState, action) => {
        const update = {
          id: action.meta.arg.applicationId,
          changes: {
            deployments: {
              ...state.entities[action.meta.arg.applicationId]?.deployments,
              loadingStatus: action.meta.arg.silently ? 'loaded' : 'loading',
            },
          },
        }
        applicationsAdapter.updateOne(state, update as Update<Application>)
      })
      .addCase(fetchApplicationDeployments.fulfilled, (state: ApplicationsState, action) => {
        const update = {
          id: action.meta.arg.applicationId,
          changes: {
            deployments: {
              loadingStatus: 'loaded',
              items: action.payload,
            },
          },
        }
        applicationsAdapter.updateOne(state, update as Update<Application>)
      })
      .addCase(fetchApplicationDeployments.rejected, (state: ApplicationsState, action) => {
        const update = {
          id: action.meta.arg.applicationId,
          changes: {
            deployments: {
              loadingStatus: 'error',
            },
          },
        }
        applicationsAdapter.updateOne(state, update as Update<Application>)
      })
      // get application status
      .addCase(fetchApplicationStatus.pending, (state: ApplicationsState, action) => {
        const update = {
          id: action.meta.arg.applicationId,
          changes: {
            status: {
              ...state.entities[action.meta.arg.applicationId]?.status,
            },
          },
        }
        applicationsAdapter.updateOne(state, update as Update<Application>)
      })
      .addCase(fetchApplicationStatus.fulfilled, (state: ApplicationsState, action) => {
        const update = {
          id: action.meta.arg.applicationId,
          changes: {
            status: action.payload,
          },
        }
        applicationsAdapter.updateOne(state, update as Update<Application>)
        state.statusLoadingStatus = 'loaded'
      })
      .addCase(fetchApplicationStatus.rejected, (state: ApplicationsState, action) => {
        state.statusLoadingStatus = 'error'
      })
  },
})

export const applications = applicationsSlice.reducer

export const applicationsActions = applicationsSlice.actions

const { selectAll, selectEntities, selectById } = applicationsAdapter.getSelectors()

export const getApplicationsState = (rootState: RootState): ApplicationsState =>
  rootState['entities'][APPLICATIONS_FEATURE_KEY]

export const selectAllApplications = createSelector(getApplicationsState, selectAll)

export const selectApplicationsEntities = createSelector(getApplicationsState, selectEntities)

export const selectApplicationsEntitiesByEnvId = (state: RootState, environmentId: string): ApplicationEntity[] => {
  const appState = getApplicationsState(state)
  return getEntitiesByIds<Application>(appState.entities, appState?.joinEnvApplication[environmentId])
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
