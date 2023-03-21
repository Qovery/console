import { Update, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import {
  CloneRequest,
  CreateEnvironmentRequest,
  DatabasesApi,
  DeploymentHistoryEnvironment,
  Environment,
  EnvironmentActionsApi,
  EnvironmentDeploymentHistoryApi,
  EnvironmentDeploymentRule,
  EnvironmentDeploymentRuleApi,
  EnvironmentEditRequest,
  EnvironmentMainCallsApi,
  EnvironmentsApi,
  Status,
} from 'qovery-typescript-axios'
import { QueryClient, useMutation, useQuery, useQueryClient } from 'react-query'
import { EnvironmentEntity, EnvironmentsState, WebsocketRunningStatusInterface } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { refactoPayload } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environmentsApi = new EnvironmentsApi()
const environmentsActionsApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const environmentDeploymentsApi = new EnvironmentDeploymentHistoryApi()
const environmentDeploymentRulesApi = new EnvironmentDeploymentRuleApi()
const databasesApi = new DatabasesApi()

export const environmentsAdapter = createEntityAdapter<EnvironmentEntity>()

export const useFetchEnvironments = (projectId: string) => {
  const queryClient = useQueryClient()

  return useQuery<Environment[], Error>(
    ['project', projectId, 'environments'],
    async () => {
      const response = await environmentsApi.listEnvironment(projectId)
      return response.data.results as Environment[]
    },
    {
      initialData: queryClient.getQueryData(['project', projectId, 'environments']),
      onSuccess: () => {
        // refetch environmentsStatus requests
        queryClient.invalidateQueries(['environmentsStatus', projectId])
      },
      onError: (err) => toastError(err),
      enabled: projectId !== '',
    }
  )
}

export const getEnvironmentById = (environmentId: string, environments?: Environment[]) => {
  return environments?.find((environment) => environment.id === environmentId)
}

export const useFetchEnvironmentsStatus = (projectId: string) => {
  const queryClient = useQueryClient()

  return useQuery<Status[], Error>(
    ['environmentsStatus', projectId],
    async () => {
      const response = await environmentsApi.getProjectEnvironmentsStatus(projectId)
      return response.data.results as Status[]
    },
    {
      initialData: queryClient.getQueryData(['environmentsStatus', projectId]),
      onError: (err) => toastError(err),
    }
  )
}

export const getEnvironmentStatusById = (environmentId: string, status?: Status[]) => {
  return status?.find((environment) => environment.id === environmentId)
}

export const updateEnvironmentsRunningStatus = async (
  queryClient: QueryClient,
  environments: WebsocketRunningStatusInterface[]
) => {
  for (let i = 0; i < environments.length; i++) {
    const environment = environments[i]
    const queryKey = ['environments-running-status', environment.id]
    queryClient.invalidateQueries({ queryKey })
    queryClient.setQueryData(queryKey, environment)
  }
}

export const useEnvironmentRunningStatus = (environmentId: string) => {
  const queryClient = useQueryClient()

  const queryKey = ['environments-running-status', environmentId]
  const environmentsRunningStatusById: WebsocketRunningStatusInterface | undefined = queryClient.getQueryData(queryKey)
  return environmentsRunningStatusById
}

export const getEnvironmentRunningStatusById = (queryClient: QueryClient, environmentId: string) => {
  const queryKey = ['environments-running-status', environmentId]
  const environmentsRunningStatusById: WebsocketRunningStatusInterface | undefined = queryClient.getQueryData(queryKey)
  return environmentsRunningStatusById
}

export const useEditEnvironment = (projectId: string, onSettledCallback: () => void) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ environmentId, data }: { environmentId: string; data: EnvironmentEditRequest }) => {
      const response = await environmentMainCallsApi.editEnvironment(environmentId, data)
      return response.data
    },
    {
      onSuccess: (result, variables) => {
        queryClient.setQueryData<Environment[] | undefined>(['project', projectId, 'environments'], (old) => {
          return old?.map((environment) => (environment.id === variables.environmentId ? result : environment))
        })
        toast(ToastEnum.SUCCESS, 'Your environment is updated')
      },
      onError: (err) => {
        toastError(err as Error)
      },
      onSettled: () => onSettledCallback(),
    }
  )
}

export const useFetchEnvironmentDeploymentRule = (projectId: string, environmentId: string) => {
  const queryClient = useQueryClient()

  return useQuery<EnvironmentDeploymentRule, Error>(
    ['project', projectId, 'environments', environmentId, 'deploymentRules'],
    async () => {
      const response = await environmentDeploymentRulesApi.getEnvironmentDeploymentRule(environmentId)
      return response.data
    },
    {
      initialData: queryClient.getQueryData(['project', projectId, 'environments', environmentId, 'deploymentRules']),
      onError: (err) => toastError(err),
    }
  )
}

export const useEditEnvironmentDeploymentRule = (
  projectId: string,
  environmentId: string,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({
      environmentId,
      deploymentRuleId,
      data,
    }: {
      environmentId: string
      deploymentRuleId: string
      data: EnvironmentDeploymentRule
    }) => {
      const cloneEnvironmentDeploymentRules = Object.assign({}, refactoPayload(data))
      const response = await environmentDeploymentRulesApi.editEnvironmentDeploymentRule(
        environmentId,
        deploymentRuleId,
        cloneEnvironmentDeploymentRules
      )
      return response.data
    },
    {
      onSuccess: (result) => {
        queryClient.setQueryData<EnvironmentDeploymentRule>(
          ['project', projectId, 'environments', environmentId, 'deploymentRules'],
          result
        )
        toast(ToastEnum.SUCCESS, 'Your environment deployment rules is updated')
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useEnvironmentDeploymentHistory = (projectId: string, environmentId: string) => {
  const queryClient = useQueryClient()

  return useQuery<DeploymentHistoryEnvironment[], Error>(
    ['project', projectId, 'environments', environmentId, 'deploymentHistory'],
    async () => {
      const response = await environmentDeploymentsApi.listEnvironmentDeploymentHistory(environmentId)
      return response.data.results as DeploymentHistoryEnvironment[]
    },
    {
      initialData: queryClient.getQueryData(['project', projectId, 'environments', environmentId, 'deploymentHistory']),
      onError: (err) => toastError(err),
    }
  )
}

export const useCreateEnvironment = (
  onSuccessCallback?: (result: Environment) => void,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ projectId, data }: { projectId: string; data: CreateEnvironmentRequest }) => {
      const response = await environmentsApi.createEnvironment(projectId, data)
      return response.data
    },
    {
      onSuccess: (result, variables) => {
        queryClient.setQueryData<Environment[] | undefined>(['project', variables.projectId, 'environments'], (old) => {
          return old ? [...old, result] : old
        })

        toast(ToastEnum.SUCCESS, 'Your environment has been successfully created')
        onSuccessCallback && onSuccessCallback(result)
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useCloneEnvironment = (
  projectId: string,
  onSuccessCallback?: (result: Environment) => void,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ environmentId, data }: { environmentId: string; data: CloneRequest }) => {
      const response = await environmentsActionsApi.cloneEnvironment(environmentId, data)
      return response.data
    },
    {
      onSuccess: (result) => {
        queryClient.setQueryData<Environment[] | undefined>(['project', projectId, 'environments'], (old) => {
          return old ? [...old, result] : old
        })

        toast(ToastEnum.SUCCESS, 'Your environment has been successfully cloned')
        onSuccessCallback && onSuccessCallback(result)
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const fetchDatabaseConfiguration = createAsyncThunk(
  'environment/database-configuration/fetch',
  async (payload: { environmentId: string }) => {
    const response = await databasesApi.listEnvironmentDatabaseConfig(payload.environmentId)
    return response.data.results
  }
)

export const initialEnvironmentsState: EnvironmentsState = environmentsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  loadingEnvironmentStatus: 'not loaded',
  loadingEnvironmentDeployments: 'not loaded',
  loadingEnvironmentDeploymentRules: 'not loaded',
  error: null,
  joinProjectEnvironments: {},
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
      // fetch database configurations for this environment
      .addCase(fetchDatabaseConfiguration.pending, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg.environmentId,
          changes: {
            databaseConfigurations: {
              loadingStatus: 'loading',
            },
          },
        }
        environmentsAdapter.updateOne(state, update)
      })
      .addCase(fetchDatabaseConfiguration.fulfilled, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg.environmentId,
          changes: {
            databaseConfigurations: {
              loadingStatus: 'loaded',
              data: action.payload,
            },
          },
        }
        environmentsAdapter.updateOne(state, update)
      })
  },
})

export const environments = environmentsSlice.reducer

export const environmentsActions = environmentsSlice.actions

export const getEnvironmentsState = (rootState: RootState): EnvironmentsState =>
  rootState.environment[ENVIRONMENTS_FEATURE_KEY]

export const selectEnvironmentById = (state: RootState, environmentId: string) =>
  getEnvironmentsState(state).entities[environmentId]
