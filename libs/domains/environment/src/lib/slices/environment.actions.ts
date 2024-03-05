import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Environment, EnvironmentActionsApi, EnvironmentMainCallsApi } from 'qovery-typescript-axios'

const environmentActionApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()

/*
 * @deprecated use `useDeployEnvironment` from `@qovery/domains/environments/feature` instead of `useActionRedeployEnvironment`
 */
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
          title: 'Your environment is redeploying',
          labelAction: 'See Deployment Logs',
          callback: () => callback && callback(),
        },
        notifyOnError: true,
      },
    }
  )
}
/*
 * @deprecated use `useCancelEnvironment` from `@qovery/domains/environments/feature` instead of `useActionCancelEnvironment`
 */
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

/*
 * @deprecated use `useDeleteEnvironment` from `@qovery/domains/environments/feature` instead of `useDeleteEnvironment`
 */
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
