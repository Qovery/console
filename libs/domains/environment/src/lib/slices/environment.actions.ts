import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  type DeployAllRequest,
  type Environment,
  EnvironmentActionsApi,
  EnvironmentMainCallsApi,
} from 'qovery-typescript-axios'

const environmentActionApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()

export const useActionRedeployEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void,
  callback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      const response = await environmentActionApi.redeployEnvironment(environmentId)
      return response.data
    },
    {
      onSuccess: () => {
        // refetch environmentsStatus requests
        queryClient.invalidateQueries(['environmentsStatus', projectId])

        if (withDeployments)
          queryClient.invalidateQueries(['project', projectId, 'environments', environmentId, 'deploymentHistory'])
      },
      onSettled: () => onSettledCallback && onSettledCallback(),
      meta: {
        notifyOnSuccess: {
          title: 'Your environment is redeploying',
          labelAction: 'See Deployment Logs',
          callback: () => callback && callback(),
        },
        notifyOnError: true,
      },
    }
  )
}

export const useActionDeployEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void,
  callback?: () => void
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
      },
      onSettled: () => onSettledCallback && onSettledCallback(),
      meta: {
        notifyOnSuccess: {
          title: 'Your environment is deploying',
          labelAction: 'See Deployment Logs',
          callback: () => callback && callback(),
        },
        notifyOnError: true,
      },
    }
  )
}

export const useActionDeployAllEnvironment = (
  environmentId: string,
  onSuccessCallback?: () => void,
  callback?: () => void
) => {
  return useMutation(
    async (deployRequest?: DeployAllRequest) => {
      const response = await environmentActionApi.deployAllServices(environmentId, deployRequest)
      return response.data
    },
    {
      onSuccess: () => {
        onSuccessCallback && onSuccessCallback()
      },
      meta: {
        notifyOnSuccess: {
          title: 'Your environment are being updated',
          labelAction: 'See Deployment Logs',
          callback: () => callback && callback(),
        },
        notifyOnError: true,
      },
    }
  )
}

export const useActionStopEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void,
  callback?: () => void
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
      },
      onSettled: () => onSettledCallback && onSettledCallback(),
      meta: {
        notifyOnSuccess: {
          title: 'Your environment is stopping',
          labelAction: 'See Deployment Logs',
          callback: () => callback && callback(),
        },
        notifyOnError: true,
      },
    }
  )
}

export const useActionCancelEnvironment = (
  projectId: string,
  environmentId: string,
  withDeployments?: boolean,
  onSettledCallback?: () => void,
  callback?: () => void
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
      },
      onSettled: () => onSettledCallback && onSettledCallback(),
      meta: {
        notifyOnSuccess: {
          title: 'Your environment deployment is cancelling',
          labelAction: 'See Deployment Logs',
          callback: () => callback && callback(),
        },
        notifyOnError: true,
      },
    }
  )
}

export const useDeleteEnvironment = (
  projectId: string,
  environmentId: string,
  onSettledCallback?: () => void,
  force?: boolean,
  callback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async () => {
      const response = await environmentMainCallsApi.deleteEnvironment(environmentId)
      return response.data
    },
    {
      onSuccess: () => {
        if (force) {
          queryClient.setQueryData<Environment[] | undefined>(['project', projectId, 'environments'], (old) => {
            return old?.filter((environment) => environment.id !== environmentId)
          })
        }
      },
      onSettled: () => onSettledCallback && onSettledCallback(),
      meta: {
        notifyOnSuccess: {
          title: 'Your environment is being deleted',
          labelAction: 'See Deployment Logs',
          callback: () => callback && callback(),
        },
        notifyOnError: true,
      },
    }
  )
}
