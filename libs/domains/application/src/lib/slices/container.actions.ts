import { createAsyncThunk } from '@reduxjs/toolkit'
import { ContainerActionsApi, ContainerMainCallsApi } from 'qovery-typescript-axios'
import { ToastEnum, toast } from '@console/shared/toast'

// import { fetchApplicationsStatus } from './applications.slice'

const containerActionApi = new ContainerActionsApi()
const applicationMainCallsApi = new ContainerMainCallsApi()

export const postContainerActionsRestart = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; withDeployments?: boolean }
>('containerActions/restart', async (data, { dispatch }) => {
  try {
    const response = await containerActionApi.restartContainer(data.applicationId)
    if (response.status === 202) {
      // refetch status after update
      // await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      // if (data.withDeployments)
      //   await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your container is redeploying')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Redeploying error')
  }
})

export const postContainerActionsDeploy = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; withDeployments?: boolean }
>('applicationActions/deploy', async (data, { dispatch }) => {
  try {
    const response = await containerActionApi.restartContainer(data.applicationId)
    if (response.status === 202) {
      // refetch status after update
      // await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      // if (data.withDeployments)
      //   await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your container is deploying')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error')
  }
})

export const postContainerActionsStop = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; withDeployments?: boolean }
>('applicationActions/stop', async (data, { dispatch }) => {
  try {
    const response = await containerActionApi.stopContainer(data.applicationId)
    if (response.status === 202) {
      // refetch status after update
      // await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      // if (data.withDeployments)
      //   await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your container is stopping')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Stopping error')
  }
})

export const deleteContainerAction = createAsyncThunk<any, { environmentId: string; applicationId: string }>(
  'applicationActions/delete',
  async (data, { dispatch }) => {
    try {
      const response = await applicationMainCallsApi.deleteContainer(data.applicationId)
      if (response.status === 204) {
        // refetch status after update
        // await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your container is being deleted')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deleting error')
    }
  }
)
