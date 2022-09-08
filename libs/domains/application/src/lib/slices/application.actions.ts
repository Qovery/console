import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  ApplicationActionsApi,
  ApplicationMainCallsApi,
  ContainerActionsApi,
  ContainerMainCallsApi,
} from 'qovery-typescript-axios'
import { ServicesEnum } from '@console/shared/enums'
import { ToastEnum, toast } from '@console/shared/toast'
import { fetchApplicationDeployments, fetchApplicationsStatus } from './applications.slice'

const applicationActionApi = new ApplicationActionsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()

const containerActionApi = new ContainerActionsApi()
const containerMainCallsApi = new ContainerMainCallsApi()

export const postApplicationActionsRestart = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServicesEnum; withDeployments?: boolean }
>('applicationActions/restart', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServicesEnum.CONTAINER) {
      response = await containerActionApi.restartContainer(data.applicationId)
    } else {
      response = await applicationActionApi.restartApplication(data.applicationId)
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      if (data.withDeployments)
        await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your application is redeploying')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Redeploying error')
  }
})

export const postApplicationActionsDeploy = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServicesEnum; withDeployments?: boolean }
>('applicationActions/deploy', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServicesEnum.CONTAINER) {
      response = await containerActionApi.restartContainer(data.applicationId)
    } else {
      response = await applicationActionApi.restartApplication(data.applicationId)
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      if (data.withDeployments)
        await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your application is deploying')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error')
  }
})

export const postApplicationActionsStop = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServicesEnum; withDeployments?: boolean }
>('applicationActions/stop', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServicesEnum.CONTAINER) {
      response = await containerActionApi.stopContainer(data.applicationId)
    } else {
      response = await applicationActionApi.stopApplication(data.applicationId)
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      // refetch deployments after update
      if (data.withDeployments)
        await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your application is stopping')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Stopping error')
  }
})

export const deleteApplicationAction = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServicesEnum }
>('applicationActions/delete', async (data, { dispatch }) => {
  try {
    let response
    if (data.serviceType === ServicesEnum.CONTAINER) {
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
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Deleting error')
  }
})
