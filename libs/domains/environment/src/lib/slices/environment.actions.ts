import { SerializedError, createAsyncThunk } from '@reduxjs/toolkit'
import { DeployAllRequest, Environment, EnvironmentActionsApi, EnvironmentMainCallsApi } from 'qovery-typescript-axios'
import { useMutation, useQueryClient } from 'react-query'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { fetchEnvironmentDeploymentHistory, fetchEnvironmentsStatus } from './environments.slice'

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

export const postEnvironmentActionsDeploy = createAsyncThunk<
  any,
  { projectId: string; environmentId: string; withDeployments?: boolean }
>('environmentActions/deploy', async (data, { dispatch }) => {
  try {
    const response = await environmentActionApi.deployEnvironment(data.environmentId)
    if (response.status === 200) {
      // refetch status after update
      await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
      // refresh deployments after update
      if (data.withDeployments)
        await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your environment is deploying')
    }
    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error', err.message)
  }
})

export const postEnvironmentServicesUpdate = createAsyncThunk<
  any,
  { environmentId: string; deployRequest: DeployAllRequest }
>('environmentActions/deploy', async (data, { dispatch }) => {
  try {
    const response = await environmentActionApi.deployAllServices(data.environmentId, data.deployRequest)
    if (response.status === 200) {
      toast(ToastEnum.SUCCESS, 'Your environment are being updated')
    }
    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Update error', (err as SerializedError).message)
  }
})

export const postEnvironmentActionsStop = createAsyncThunk<
  any,
  { projectId: string; environmentId: string; withDeployments?: boolean }
>('environmentActions/stop', async (data, { dispatch }) => {
  try {
    const response = await environmentActionApi.stopEnvironment(data.environmentId)
    if (response.status === 200) {
      // refetch status after update
      await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
      // refresh deployments after update
      if (data.withDeployments)
        await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your environment is stopping')
    }
    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Stopping error', err.message)
  }
})

export const postEnvironmentActionsCancelDeployment = createAsyncThunk<
  any,
  { projectId: string; environmentId: string; withDeployments?: boolean }
>('environmentActions/cancel-deployment', async (data, { dispatch }) => {
  try {
    const response = await environmentActionApi.cancelEnvironmentDeployment(data.environmentId)
    if (response.status === 200) {
      // refetch status after update
      await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
      // refresh deployments after update
      if (data.withDeployments)
        await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your environment deployment is cancelling')
    }

    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Cancelling error', err.message)
  }
})

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
