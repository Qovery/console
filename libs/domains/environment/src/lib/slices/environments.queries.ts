import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import download from 'downloadjs'
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
  EnvironmentExportApi,
  EnvironmentMainCallsApi,
  EnvironmentsApi,
} from 'qovery-typescript-axios'
import { WebsocketRunningStatusInterface } from '@qovery/shared/interfaces'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { refactoPayload } from '@qovery/shared/utils'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environmentsApi = new EnvironmentsApi()
const environmentsActionsApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const environmentDeploymentsApi = new EnvironmentDeploymentHistoryApi()
const environmentDeploymentRulesApi = new EnvironmentDeploymentRuleApi()
const environmentExport = new EnvironmentExportApi()
const databasesApi = new DatabasesApi()

export const useFetchEnvironments = <TData = Environment[]>(
  projectId: string,
  select?: (data: Environment[]) => TData
) => {
  const queryClient = useQueryClient()

  return useQuery(
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
      onError: (err) => toastError(err as Error),
      enabled: projectId !== '',
      select,
    }
  )
}

export const useFetchEnvironment = (projectId: string, environmentId: string) =>
  useFetchEnvironments(projectId, (environments) =>
    environments.find((environment) => environment.id === environmentId)
  )

/**
 * @deprecated This should be migrated to the new `use-status-web-sockets` hook
 */
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

export const useFetchDatabaseConfiguration = (projectId: string, environmentId: string, enabled = true) => {
  return useQuery<DatabaseConfiguration[], Error>(
    ['project', projectId, 'environments', environmentId, 'databaseConfiguration'],
    async () => {
      const response = await databasesApi.listEnvironmentDatabaseConfig(environmentId)
      return response.data.results as DatabaseConfiguration[]
    },
    {
      onError: (err) => toastError(err),
      enabled: enabled,
    }
  )
}

export const useFetchEnvironmentExportTerraform = (projectId: string, environmentId: string) => {
  return useMutation(
    ['project', projectId, 'environments', environmentId, 'terraformExport'],
    async ({ exportSecrets }: { exportSecrets: boolean }) => {
      const response = await environmentExport.exportEnvironmentConfigurationIntoTerraform(
        environmentId,
        exportSecrets,
        {
          responseType: 'blob',
        }
      )
      return response.data
    },
    {
      onSuccess: (data) => {
        download(data, `terraform-manifest-${environmentId}.zip`, 'application/zip')
      },
      onError: (err) => toastError(err as Error),
    }
  )
}
