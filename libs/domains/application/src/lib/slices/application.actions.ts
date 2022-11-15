import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  ApplicationActionsApi,
  ApplicationMainCallsApi,
  ContainerActionsApi,
  ContainerMainCallsApi,
} from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ToastEnum, toast } from '@qovery/shared/toast'
import { fetchApplicationDeployments, fetchApplicationsStatus } from './applications.slice'

const applicationActionApi = new ApplicationActionsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()

const containerActionApi = new ContainerActionsApi()
const containerMainCallsApi = new ContainerMainCallsApi()

export const postApplicationActionsRestart = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean }
>('applicationActions/restart', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServiceTypeEnum.CONTAINER) {
      response = await containerActionApi.restartContainer(data.applicationId)
    } else {
      response = await applicationActionApi.restartApplication(data.applicationId)
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      if (data.withDeployments)
        await dispatch(
          fetchApplicationDeployments({
            applicationId: data.applicationId,
            serviceType: data.serviceType,
            silently: true,
          })
        )
      // success message
      toast(ToastEnum.SUCCESS, 'Your application is redeploying')
    }

    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Redeploying error', err.message)
  }
})

export const postApplicationActionsDeploy = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean }
>('applicationActions/deploy', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServiceTypeEnum.CONTAINER) {
      response = await containerActionApi.restartContainer(data.applicationId)
    } else {
      response = await applicationActionApi.restartApplication(data.applicationId)
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      if (data.withDeployments)
        await dispatch(
          fetchApplicationDeployments({
            applicationId: data.applicationId,
            serviceType: data.serviceType,
            silently: true,
          })
        )
      // success message
      toast(ToastEnum.SUCCESS, 'Your application is deploying')
    }

    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error', err.message)
  }
})

export const postApplicationActionsDeployByCommitId = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; git_commit_id: string }
>('applicationActions/deploy', async (data, { dispatch }) => {
  try {
    const response = await applicationActionApi.deployApplication(data.applicationId, {
      git_commit_id: data.git_commit_id,
    })

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      toast(ToastEnum.SUCCESS, 'Your application is deploying')
    }

    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error', err.message)
  }
})

export const postApplicationActionsStop = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean }
>('applicationActions/stop', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServiceTypeEnum.CONTAINER) {
      response = await containerActionApi.stopContainer(data.applicationId)
    } else {
      response = await applicationActionApi.stopApplication(data.applicationId)
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      if (data.withDeployments)
        await dispatch(
          fetchApplicationDeployments({
            applicationId: data.applicationId,
            serviceType: data.serviceType,
            silently: true,
          })
        )
      // success message
      toast(ToastEnum.SUCCESS, 'Your application is stopping')
    }

    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Stopping error', err.message)
  }
})

export const deleteApplicationAction = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum }
>('applicationActions/delete', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServiceTypeEnum.CONTAINER) {
      response = await containerMainCallsApi.deleteContainer(data.applicationId)
    } else {
      response = await applicationMainCallsApi.deleteApplication(data.applicationId)
    }

    if (response.status === 204) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your application is being deleted')
    }

    return response
  } catch (err: any) {
    // error message
    return toast(ToastEnum.ERROR, 'Deleting error', err.message)
  }
})
