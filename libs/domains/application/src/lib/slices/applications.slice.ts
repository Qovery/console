import {
  type PayloadAction,
  type Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { type QueryClient } from '@tanstack/react-query'
import {
  type ApplicationAdvancedSettings,
  ApplicationConfigurationApi,
  type ApplicationEditRequest,
  ApplicationMainCallsApi,
  type ApplicationRequest,
  ApplicationsApi,
  type ContainerAdvancedSettings,
  ContainerConfigurationApi,
  ContainerMainCallsApi,
  type ContainerRequest,
  ContainersApi,
  type JobAdvancedSettings,
  JobConfigurationApi,
  JobMainCallsApi,
  type JobRequest,
  JobsApi,
  type Link,
} from 'qovery-typescript-axios'
import { type ServiceTypeEnum, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import {
  type AdvancedSettings,
  type ApplicationEntity,
  type ApplicationsState,
  type ContainerApplicationEntity,
  type GitApplicationEntity,
  type JobApplicationEntity,
  type LoadingStatus,
} from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import {
  addOneToManyRelation,
  getEntitiesByIds,
  refactoContainerApplicationPayload,
  refactoGitApplicationPayload,
  refactoJobPayload,
  removeOneToManyRelation,
  sortByKey,
} from '@qovery/shared/util-js'
import { type RootState } from '@qovery/state/store'
import { queries } from '@qovery/state/util-queries'

export const APPLICATIONS_FEATURE_KEY = 'applications'

export const applicationsAdapter = createEntityAdapter<ApplicationEntity>()

const applicationsApi = new ApplicationsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()
const applicationConfigurationApi = new ApplicationConfigurationApi()

const containersApi = new ContainersApi()
const containerMainCallsApi = new ContainerMainCallsApi()
const containerConfigurationApi = new ContainerConfigurationApi()

const jobsApi = new JobsApi()
const jobMainCallsApi = new JobMainCallsApi()
const jobConfigurationApi = new JobConfigurationApi()

export const fetchApplications = createAsyncThunk<ApplicationEntity[], { environmentId: string }>(
  'applications/fetch',
  async (data) => {
    const result = await Promise.all([
      // fetch Git applications
      applicationsApi.listApplication(data.environmentId),
      // fetch Container applications
      containersApi.listContainer(data.environmentId),
      // fetch Jobs applications
      jobsApi.listJobs(data.environmentId),
    ])

    return [
      ...(result[0].data.results as GitApplicationEntity[]),
      ...(result[1].data.results as ContainerApplicationEntity[]),
      ...(result[2].data.results as JobApplicationEntity[]),
    ] as ApplicationEntity[]
  }
)

export const editApplication = createAsyncThunk(
  'application/edit',
  async (payload: {
    applicationId: string
    data: Partial<Omit<ApplicationEntity, 'registry'>> & { registry?: { id?: string | undefined } }
    serviceType: ServiceTypeEnum
    toasterCallback: () => void
    silentToaster?: boolean
    queryClient: QueryClient
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

    if (response.data.environment?.id) {
      payload.queryClient.invalidateQueries({
        queryKey: queries.services.list(response.data.environment.id).queryKey,
      })
    }
    payload.queryClient.invalidateQueries({
      // NOTE: we don't care about the serviceType here because it's not related to cache
      queryKey: queries.services.details({ serviceId: payload.applicationId, serviceType: 'APPLICATION' }).queryKey,
    })

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
      data.settings as ContainerAdvancedSettings
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

export const deleteApplicationAction = createAsyncThunk(
  'applicationActions/delete',
  async (
    data: {
      environmentId: string
      applicationId: string
      serviceType?: ServiceTypeEnum
      force?: boolean
      queryClient: QueryClient
    },
    { dispatch }
  ) => {
    try {
      let response
      if (isContainer(data.serviceType)) {
        response = await containerMainCallsApi.deleteContainer(data.applicationId)
      } else if (isJob(data.serviceType)) {
        response = await jobMainCallsApi.deleteJob(data.applicationId)
      } else {
        response = await applicationMainCallsApi.deleteApplication(data.applicationId)
      }

      if (response.status === 204) {
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is being deleted')
      }

      data.queryClient.invalidateQueries({
        queryKey: queries.services.list(data.environmentId).queryKey,
      })

      return response
    } catch (err) {
      // error message
      toast(ToastEnum.ERROR, 'Deleting error', (err as Error).message)
      return
    }
  }
)

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
        state.loadingStatus = 'loaded'
        toastError(action.error)
      })
      .addCase(deleteApplicationAction.fulfilled, (state: ApplicationsState, action) => {
        if (action.meta.arg.force) {
          applicationsAdapter.removeOne(state, action.meta.arg.applicationId)
          state.joinEnvApplication = removeOneToManyRelation(action.meta.arg.applicationId, {
            ...state.joinEnvApplication,
          })
        }
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
          action.error.message
            ? action.error.message
            : `Your advanced settings have not been updated. Something must be wrong with the values provided`
        )
        applicationsAdapter.updateOne(state, update)
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

const { selectAll, selectEntities } = applicationsAdapter.getSelectors()

export const getApplicationsState = (rootState: RootState): ApplicationsState =>
  rootState.application[APPLICATIONS_FEATURE_KEY]

export const selectAllApplications = createSelector(getApplicationsState, selectAll)

export const selectApplicationsEntities = createSelector(getApplicationsState, selectEntities)

export const selectApplicationsEntitiesByEnvId = (
  state: RootState,
  environmentId: string,
  sortBy: keyof ApplicationEntity = 'name'
): ApplicationEntity[] => {
  const appState = getApplicationsState(state)
  const entities = getEntitiesByIds<ApplicationEntity>(appState.entities, appState?.joinEnvApplication[environmentId])
  return sortBy ? sortByKey<ApplicationEntity>(entities, sortBy) : entities
}

export const selectApplicationById = (state: RootState, applicationId: string): ApplicationEntity | undefined =>
  getApplicationsState(state).entities[applicationId]

export const applicationsLoadingStatus = (state: RootState): LoadingStatus => getApplicationsState(state).loadingStatus
