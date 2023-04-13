import {
  CloneRequest,
  CreateEnvironmentRequest,
  DatabaseConfiguration,
  DatabasesApi,
  DeploymentHistoryEnvironment,
  Environment,
  EnvironmentActionsApi,
  EnvironmentDeploymentHistoryApi,
  EnvironmentDeploymentRule,
  EnvironmentDeploymentRuleApi,
  EnvironmentEditRequest,
  EnvironmentMainCallsApi,
  EnvironmentStatus,
  EnvironmentsApi,
} from 'qovery-typescript-axios'
import { QueryClient, useMutation, useQuery, useQueryClient } from 'react-query'
import { WebsocketRunningStatusInterface } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { refactoPayload } from '@qovery/shared/utils'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environmentsApi = new EnvironmentsApi()
const environmentsActionsApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const environmentDeploymentsApi = new EnvironmentDeploymentHistoryApi()
const environmentDeploymentRulesApi = new EnvironmentDeploymentRuleApi()
const databasesApi = new DatabasesApi()

export const useFetchEnvironments = (projectId: string) => {
  const queryClient = useQueryClient()

  return useQuery<Environment[], Error>(
    ['project', projectId, 'environments'],
    async () => {
      const response = await environmentsApi.listEnvironment(projectId)
      return response.data.results as Environment[]
    },
    {
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
  return useQuery<EnvironmentStatus[], Error>(
    ['environmentsStatus', projectId],
    async () => {
      const response = await environmentsApi.getProjectEnvironmentsStatus(projectId)
      return response.data.results as EnvironmentStatus[]
    },
    {
      onError: (err) => toastError(err),
      enabled: projectId !== '',
    }
  )
}

export const getEnvironmentStatusById = (
  environmentId: string,
  status?: EnvironmentStatus[]
): EnvironmentStatus | undefined => {
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

export const useGetEnvironmentRunningStatusById = (environmentId: string, isLoading: boolean) => {
  return useQuery<WebsocketRunningStatusInterface, Error>(['environments-running-status', environmentId], {
    // removed error when we use mock id
    enabled: !isLoading,
  })
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
  return useQuery<EnvironmentDeploymentRule, Error>(
    ['project', projectId, 'environments', environmentId, 'deploymentRules'],
    async () => {
      const response = await environmentDeploymentRulesApi.getEnvironmentDeploymentRule(environmentId)
      return response.data
    },
    {
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
  return useQuery<DeploymentHistoryEnvironment[], Error>(
    ['project', projectId, 'environments', environmentId, 'deploymentHistory'],
    async () => {
      const response = await environmentDeploymentsApi.listEnvironmentDeploymentHistory(environmentId)
      return response.data.results as DeploymentHistoryEnvironment[]
    },
    {
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

export const useFetchDatabaseConfiguration = (projectId: string, environmentId: string) => {
  return useQuery<DatabaseConfiguration[], Error>(
    ['project', projectId, 'environments', environmentId, 'databaseConfiguration'],
    async () => {
      const response = await databasesApi.listEnvironmentDatabaseConfig(environmentId)
      return response.data.results as DatabaseConfiguration[]
    },
    {
      onError: (err) => toastError(err),
    }
  )
}
