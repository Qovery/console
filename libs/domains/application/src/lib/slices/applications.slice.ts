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
  type ApplicationEditRequest,
  ApplicationMainCallsApi,
  type ApplicationRequest,
  ApplicationsApi,
  ContainerMainCallsApi,
  type ContainerRequest,
  ContainersApi,
  JobMainCallsApi,
  type JobRequest,
  JobsApi,
} from 'qovery-typescript-axios'
import { type ServiceTypeEnum, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import {
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

const containersApi = new ContainersApi()
const containerMainCallsApi = new ContainerMainCallsApi()

const jobsApi = new JobsApi()
const jobMainCallsApi = new JobMainCallsApi()

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
