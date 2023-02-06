import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
  ApplicationAdvancedSettings,
  ApplicationConfigurationApi,
  ApplicationDeploymentHistoryApi,
  ApplicationEditRequest,
  ApplicationMainCallsApi,
  ApplicationMetricsApi,
  ApplicationRequest,
  ApplicationsApi,
  Commit,
  ContainerAdvancedSettings,
  ContainerConfigurationApi,
  ContainerDeploymentHistoryApi,
  ContainerMainCallsApi,
  ContainerMetricsApi,
  ContainerRequest,
  ContainersApi,
  DeploymentHistoryApplication,
  Instance,
  JobAdvancedSettings,
  JobConfigurationApi,
  JobDeploymentHistoryApi,
  JobMainCallsApi,
  JobRequest,
  JobsApi,
  Link,
  Status,
} from 'qovery-typescript-axios'
import { ServiceTypeEnum, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import {
  AdvancedSettings,
  ApplicationEntity,
  ApplicationsState,
  ContainerApplicationEntity,
  GitApplicationEntity,
  JobApplicationEntity,
  LoadingStatus,
  ServiceRunningStatus,
} from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import {
  addOneToManyRelation,
  getEntitiesByIds,
  refactoContainerApplicationPayload,
  refactoGitApplicationPayload,
  refactoJobPayload,
  shortToLongId,
} from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const APPLICATIONS_FEATURE_KEY = 'applications'

export const applicationsAdapter = createEntityAdapter<ApplicationEntity>()

const applicationsApi = new ApplicationsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()
const applicationDeploymentsApi = new ApplicationDeploymentHistoryApi()
const applicationMetricsApi = new ApplicationMetricsApi()
const applicationConfigurationApi = new ApplicationConfigurationApi()

const containersApi = new ContainersApi()
const containerMainCallsApi = new ContainerMainCallsApi()
const containerMetricsApi = new ContainerMetricsApi()
const containerDeploymentsApi = new ContainerDeploymentHistoryApi()
const containerConfigurationApi = new ContainerConfigurationApi()

const jobsApi = new JobsApi()
const jobMainCallsApi = new JobMainCallsApi()
const jobDeploymentsApi = new JobDeploymentHistoryApi()
const jobConfigurationApi = new JobConfigurationApi()

export const fetchApplications = createAsyncThunk<
  ApplicationEntity[],
  { environmentId: string; withoutStatus?: boolean }
>('applications/fetch', async (data, thunkApi) => {
  const result = await Promise.all([
    // fetch Git applications
    applicationsApi.listApplication(data.environmentId),
    // fetch Container applications
    containersApi.listContainer(data.environmentId),
    // fetch Jobs applications
    jobsApi.listJobs(data.environmentId),
  ])

  if (!data.withoutStatus) {
    thunkApi.dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
  }

  return [
    ...(result[0].data.results as GitApplicationEntity[]),
    ...(result[1].data.results as ContainerApplicationEntity[]),
    ...(result[2].data.results as JobApplicationEntity[]),
  ] as ApplicationEntity[]
})

export const fetchApplicationsStatus = createAsyncThunk<Status[], { environmentId: string }>(
  'applications-status/fetch',
  async (data) => {
    const result = await Promise.all([
      // fetch status Git applications
      applicationsApi.getEnvironmentApplicationStatus(data.environmentId),
      // fetch status Container applications
      containersApi.getEnvironmentContainerStatus(data.environmentId),
      // fetch status Jobs applications
      jobsApi.getEnvironmentJobStatus(data.environmentId),
    ])

    return [
      ...(result[0].data.results as Status[]),
      ...(result[1].data.results as Status[]),
      ...(result[2].data.results as Status[]),
    ]
  }
)

export const editApplication = createAsyncThunk(
  'application/edit',
  async (payload: {
    applicationId: string
    data: Partial<ApplicationEntity>
    serviceType: ServiceTypeEnum
    toasterCallback: () => void
    silentToaster?: boolean
  }) => {
    let response
    if (isContainer(payload.serviceType)) {
      const cloneApplication = Object.assign(
        {},
        refactoContainerApplicationPayload(payload.data as Partial<ContainerApplicationEntity>)
      )
      response = await containerMainCallsApi.editContainer(payload.applicationId, cloneApplication as ContainerRequest)
    } else if (isJob(payload.serviceType)) {
      const cloneJob = Object.assign({}, refactoJobPayload(payload.data as Partial<JobApplicationEntity>))
      response = await jobMainCallsApi.editJob(payload.applicationId, cloneJob as JobRequest)
    } else {
      const cloneApplication = Object.assign(
        {},
        refactoGitApplicationPayload(payload.data as Partial<GitApplicationEntity>)
      )
      response = await applicationMainCallsApi.editApplication(
        payload.applicationId,
        cloneApplication as ApplicationEditRequest
      )
    }

    return response.data as ApplicationEntity
  }
)

export const createApplication = createAsyncThunk(
  'application/create',
  async (payload: {
    environmentId: string
    data: ApplicationRequest | ContainerRequest | JobRequest
    serviceType: ServiceTypeEnum
  }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await containersApi.createContainer(payload.environmentId, payload.data as ContainerRequest)
    } else if (isApplication(payload.serviceType)) {
      response = await applicationsApi.createApplication(payload.environmentId, payload.data as ApplicationRequest)
    } else {
      response = await jobsApi.createJob(payload.environmentId, payload.data as JobRequest)
    }

    return response.data as ApplicationEntity
  }
)

export const fetchApplicationLinks = createAsyncThunk<Link[], { applicationId: string; serviceType?: ServiceTypeEnum }>(
  'application/links',
  async (data) => {
    let response

    if (isContainer(data.serviceType)) {
      response = await containerMainCallsApi.listContainerLinks(data.applicationId)
    } else {
      response = await applicationMainCallsApi.listApplicationLinks(data.applicationId)
    }
    return response.data.results as Link[]
  }
)

export const fetchApplicationInstances = createAsyncThunk<
  Instance[],
  { applicationId: string; serviceType?: ServiceTypeEnum }
>('application/instances', async (data) => {
  let response

  if (isContainer(data.serviceType)) {
    response = await containerMetricsApi.getContainerCurrentInstance(data.applicationId)
  } else {
    response = await applicationMetricsApi.getApplicationCurrentInstance(data.applicationId)
  }
  return response.data.results as Instance[]
})

export const fetchApplicationCommits = createAsyncThunk<
  Commit[],
  { applicationId: string; serviceType: ServiceTypeEnum }
>('application/commits', async (data) => {
  let response
  if (isApplication(data.serviceType)) {
    response = await applicationMainCallsApi.listApplicationCommit(data.applicationId)
  } else {
    response = await jobMainCallsApi.listJobCommit(data.applicationId)
  }

  return response.data.results as Commit[]
})

export const fetchApplicationDeployments = createAsyncThunk<
  DeploymentHistoryApplication[],
  { applicationId: string; serviceType?: ServiceTypeEnum; silently?: boolean }
>('application/deployments', async (data) => {
  let response
  if (isContainer(data.serviceType)) {
    response = (await containerDeploymentsApi.listContainerDeploymentHistory(data.applicationId)) as any
  } else if (isJob(data.serviceType)) {
    response = await jobDeploymentsApi.listJobDeploymentHistory(data.applicationId)
  } else {
    response = await applicationDeploymentsApi.listApplicationDeploymentHistory(data.applicationId)
  }
  return response.data.results
})

export const fetchApplicationStatus = createAsyncThunk<
  Status,
  { applicationId: string; serviceType?: ServiceTypeEnum }
>('application/status', async (data) => {
  let response
  if (isContainer(data.serviceType)) {
    response = await containerMainCallsApi.getContainerStatus(data.applicationId)
  } else if (isJob(data.serviceType)) {
    response = await jobMainCallsApi.getJobStatus(data.applicationId)
  } else {
    response = await applicationMainCallsApi.getApplicationStatus(data.applicationId)
  }

  return response.data as Status
})

export const fetchApplicationAdvancedSettings = createAsyncThunk<
  ApplicationAdvancedSettings,
  { applicationId: string; serviceType: ServiceTypeEnum }
>('application/advancedSettings', async (data) => {
  let response
  if (isContainer(data.serviceType)) {
    response = await containerConfigurationApi.getContainerAdvancedSettings(data.applicationId)
  } else if (isJob(data.serviceType)) {
    response = await jobConfigurationApi.getJobAdvancedSettings(data.applicationId)
  } else {
    response = await applicationConfigurationApi.getAdvancedSettings(data.applicationId)
  }
  return response.data as ApplicationAdvancedSettings
})

export const editApplicationAdvancedSettings = createAsyncThunk<
  ApplicationAdvancedSettings | JobAdvancedSettings,
  {
    applicationId: string
    settings: ApplicationAdvancedSettings | ContainerAdvancedSettings | JobAdvancedSettings
    serviceType: ServiceTypeEnum
    toasterCallback: () => void
  }
>('application/advancedSettings/edit', async (data) => {
  let response
  if (isContainer(data.serviceType)) {
    response = await containerConfigurationApi.editContainerAdvancedSettings(
      data.applicationId,
      data.settings as ContainerAdvancedSettings[]
    )
  } else if (isJob(data.serviceType)) {
    response = await jobConfigurationApi.editJobAdvancedSettings(
      data.applicationId,
      data.settings as JobAdvancedSettings
    )
  } else {
    response = await applicationConfigurationApi.editAdvancedSettings(
      data.applicationId,
      data.settings as ApplicationAdvancedSettings
    )
  }
  return response.data as ApplicationAdvancedSettings
})

export const fetchDefaultApplicationAdvancedSettings = createAsyncThunk<
  AdvancedSettings,
  {
    serviceType: ServiceTypeEnum
  }
>('application/defaultAdvancedSettings', async (data) => {
  let response

  if (isApplication(data.serviceType) || isContainer(data.serviceType)) {
    response = await applicationsApi.getDefaultApplicationAdvancedSettings()
  } else if (isJob(data.serviceType)) {
    response = await jobsApi.getDefaultJobAdvancedSettings()
  } else {
    response = { data: {} }
  }
  return response.data
})

export const initialApplicationsState: ApplicationsState = applicationsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinEnvApplication: {},
  statusLoadingStatus: 'not loaded',
  defaultApplicationAdvancedSettings: {
    loadingStatus: 'not loaded',
    settings: undefined,
  },
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
      .addCase(fetchApplications.fulfilled, (state: ApplicationsState, action: PayloadAction<ApplicationEntity[]>) => {
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
      // edit application
      .addCase(editApplication.pending, (state: ApplicationsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editApplication.fulfilled, (state: ApplicationsState, action) => {
        const update: Update<ApplicationEntity> = {
          id: action.meta.arg.applicationId,
          changes: {
            ...action.payload,
          },
        }
        applicationsAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'

        if (!action.meta.arg.silentToaster) {
          toast(
            ToastEnum.SUCCESS,
            `${isJob(action.payload) ? 'Job' : 'Application'} updated`,
            'You must redeploy to apply the settings update',
            action.meta.arg.toasterCallback,
            undefined,
            'Redeploy'
          )
        }
      })
      .addCase(editApplication.rejected, (state: ApplicationsState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // create application
      .addCase(createApplication.pending, (state: ApplicationsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(createApplication.fulfilled, (state: ApplicationsState, action) => {
        const application = action.payload
        applicationsAdapter.addOne(state, application)
        state.error = null
        state.loadingStatus = 'loaded'

        state.joinEnvApplication = addOneToManyRelation(application.environment?.id, application.id, {
          ...state.joinEnvApplication,
        })
        toast(ToastEnum.SUCCESS, `Application created`)
      })
      .addCase(createApplication.rejected, (state: ApplicationsState, action) => {
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
        applicationsAdapter.updateMany(state, update as Update<ApplicationEntity>[])
        state.statusLoadingStatus = 'loaded'
      })
      .addCase(fetchApplicationsStatus.rejected, (state: ApplicationsState, action) => {
        state.statusLoadingStatus = 'error'
        state.error = action.error.message
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
      // fetch application advanced Settings
      .addCase(fetchApplicationAdvancedSettings.pending, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loading',
              current_settings: undefined,
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationAdvancedSettings.fulfilled, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loaded',
              current_settings: action.payload,
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationAdvancedSettings.rejected, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            advanced_settings: {
              loadingStatus: 'error',
              current_settings: undefined,
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      // edit application advanced Settings
      .addCase(editApplicationAdvancedSettings.pending, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loading',
              current_settings: state.entities[applicationId]?.advanced_settings?.current_settings,
            },
          },
        }
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(editApplicationAdvancedSettings.fulfilled, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loaded',
              current_settings: action.payload,
            },
          },
        }
        toast(
          ToastEnum.SUCCESS,
          `Application updated`,
          'You must redeploy to apply the settings update',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(editApplicationAdvancedSettings.rejected, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            advanced_settings: {
              loadingStatus: 'error',
              current_settings: state.entities[applicationId]?.advanced_settings?.current_settings,
            },
          },
        }

        toast(
          ToastEnum.ERROR,
          `Your advanced settings have not been updated. Something must be wrong with the values provided`
        )
        applicationsAdapter.updateOne(state, update)
      })
      .addCase(fetchApplicationCommits.pending, (state: ApplicationsState, action) => {
        const applicationId = action.meta.arg.applicationId
        const update: Update<ApplicationEntity> = {
          id: applicationId,
          changes: {
            commits: {
              ...(state.entities[applicationId] as GitApplicationEntity)?.commits,
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
        applicationsAdapter.updateOne(state, update as Update<ApplicationEntity>)
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
        applicationsAdapter.updateOne(state, update as Update<ApplicationEntity>)
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
        applicationsAdapter.updateOne(state, update as Update<ApplicationEntity>)
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
        applicationsAdapter.updateOne(state, update as Update<ApplicationEntity>)
      })
      .addCase(fetchApplicationStatus.fulfilled, (state: ApplicationsState, action) => {
        const update = {
          id: action.meta.arg.applicationId,
          changes: {
            status: action.payload,
          },
        }
        applicationsAdapter.updateOne(state, update as Update<ApplicationEntity>)
        state.statusLoadingStatus = 'loaded'
      })
      .addCase(fetchApplicationStatus.rejected, (state: ApplicationsState, action) => {
        state.statusLoadingStatus = 'error'
      })
      .addCase(fetchDefaultApplicationAdvancedSettings.pending, (state: ApplicationsState, action) => {
        state.defaultApplicationAdvancedSettings.settings = action.payload
      })
      .addCase(fetchDefaultApplicationAdvancedSettings.fulfilled, (state: ApplicationsState, action) => {
        state.defaultApplicationAdvancedSettings.settings = action.payload
        state.defaultApplicationAdvancedSettings.loadingStatus = 'loaded'
      })
      .addCase(fetchDefaultApplicationAdvancedSettings.rejected, (state: ApplicationsState, action) => {
        state.defaultApplicationAdvancedSettings.loadingStatus = 'error'
      })
  },
})

export const applications = applicationsSlice.reducer

export const applicationsActions = applicationsSlice.actions

const { selectAll, selectEntities, selectById } = applicationsAdapter.getSelectors()

export const getApplicationsState = (rootState: RootState): ApplicationsState =>
  rootState.application[APPLICATIONS_FEATURE_KEY]

export const selectAllApplications = createSelector(getApplicationsState, selectAll)

export const selectApplicationsEntities = createSelector(getApplicationsState, selectEntities)

export const selectApplicationsEntitiesByEnvId = (state: RootState, environmentId: string): ApplicationEntity[] => {
  const appState = getApplicationsState(state)
  return getEntitiesByIds<ApplicationEntity>(appState.entities, appState?.joinEnvApplication[environmentId])
}

export const selectApplicationById = (state: RootState, applicationId: string): ApplicationEntity | undefined =>
  getApplicationsState(state).entities[applicationId]

export const applicationsLoadingStatus = (state: RootState): LoadingStatus => getApplicationsState(state).loadingStatus

export const getCountNewCommitsToDeploy = (applicationId: string) =>
  createSelector(
    (state: RootState) => {
      return selectById(getApplicationsState(state), applicationId) as GitApplicationEntity
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

export const getCommitsGroupedByDate = createSelector(
  [getApplicationsState, (state, applicationId: string) => applicationId],
  (state, applicationId) => {
    const application = state.entities[applicationId] as GitApplicationEntity

    if (!application || !application.commits) return {}

    const commits: Commit[] | undefined = application.commits.items
    if (!commits) return {}

    const commitsByDate = commits.reduce((acc: Record<string, Commit[]>, obj) => {
      const key = new Date(obj['created_at']).toDateString()
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})

    return commitsByDate
  }
)
