import { DeployAllRequest, Environment, EnvironmentActionsApi, EnvironmentMainCallsApi } from 'qovery-typescript-axios'
import { useMutation, useQueryClient } from 'react-query'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

const environmentActionApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()

export const useActionRestartEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      const response = await environmentActionApi.restartEnvironment(environmentId)
      return response.data
    },
    {
      onSuccess: () => {
        // refetch environmentsStatus requests
        queryClient.invalidateQueries(['environmentsStatus', projectId])

        if (withDeployments)
          queryClient.invalidateQueries(['project', projectId, 'environments', environmentId, 'deploymentHistory'])

        toast(ToastEnum.SUCCESS, 'Your environment is redeploying')
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useActionDeployEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      const response = await environmentActionApi.deployEnvironment(environmentId)
      return response.data
    },
    {
      onSuccess: () => {
        // refetch environmentsStatus requests
        queryClient.invalidateQueries(['environmentsStatus', projectId])

        if (withDeployments)
          queryClient.invalidateQueries(['project', projectId, 'environments', environmentId, 'deploymentHistory'])

        toast(ToastEnum.SUCCESS, 'Your environment is deploying')
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useActionDeployAllEnvironment = (environmentId: string, onSuccessCallback?: () => void) => {
  return useMutation(
    async (deployRequest?: DeployAllRequest) => {
      const response = await environmentActionApi.deployAllServices(environmentId, deployRequest)
      return response.data
    },
    {
      onSuccess: () => {
        onSuccessCallback && onSuccessCallback()
        toast(ToastEnum.SUCCESS, 'Your environment are being updated')
      },
      onError: (err) => toastError(err as Error),
    }
  )
}

export const useActionStopEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      const response = await environmentActionApi.stopEnvironment(environmentId)
      return response.data
    },
    {
      onSuccess: () => {
        // refetch environmentsStatus requests
        queryClient.invalidateQueries(['environmentsStatus', projectId])

        if (withDeployments)
          queryClient.invalidateQueries(['project', projectId, 'environments', environmentId, 'deploymentHistory'])

        toast(ToastEnum.SUCCESS, 'Your environment is stopping')
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useActionCancelEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      const response = await environmentActionApi.cancelEnvironmentDeployment(environmentId)
      return response.data
    },
    {
      onSuccess: () => {
        // refetch environmentsStatus requests
        queryClient.invalidateQueries(['environmentsStatus', projectId])

        if (withDeployments)
          queryClient.invalidateQueries(['project', projectId, 'environments', environmentId, 'deploymentHistory'])

        toast(ToastEnum.SUCCESS, 'Your environment deployment is cancelling')
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useDeleteEnvironment = (projectId: string, environmentId: string, onSettledCallback?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      const response = await environmentMainCallsApi.deleteEnvironment(environmentId)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.setQueryData<Environment[] | undefined>(['project', projectId, 'environments'], (old) => {
          return old?.filter((environment) => environment.id !== environmentId)
        })
        toast(ToastEnum.SUCCESS, 'Your environment is being deleted')
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}
