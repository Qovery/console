import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  ApplicationActionsApi,
  ApplicationMainCallsApi,
  ContainerActionsApi,
  ContainerMainCallsApi,
  JobActionsApi,
  JobMainCallsApi,
} from 'qovery-typescript-axios'
import { ServiceTypeEnum, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { fetchApplicationDeployments, fetchApplicationsStatus } from './applications.slice'

const applicationActionApi = new ApplicationActionsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()

const containerActionApi = new ContainerActionsApi()
const containerMainCallsApi = new ContainerMainCallsApi()

const jobActionApi = new JobActionsApi()
const jobMainCallsApi = new JobMainCallsApi()

export const postApplicationActionsRestart = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean }
>('applicationActions/restart', async (data, { dispatch }) => {
  try {
    let response
    if (isContainer(data.serviceType)) {
      response = await containerActionApi.restartContainer(data.applicationId)
    } else if (isJob(data.serviceType)) {
      response = await jobActionApi.restartJob(data.applicationId)
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
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Redeploying error', (err as Error).message)
  }
})

export const postApplicationActionsDeploy = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean }
>('applicationActions/deploy', async (data, { dispatch }) => {
  try {
    let response
    if (isContainer(data.serviceType)) {
      response = await containerActionApi.restartContainer(data.applicationId)
    } else if (isJob(data.serviceType)) {
      response = await jobActionApi.restartJob(data.applicationId)
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
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
  }
})

export const postApplicationActionsDeployByCommitId = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; git_commit_id: string; serviceType: ServiceTypeEnum }
>('applicationActions/deploy', async (data, { dispatch }) => {
  try {
    let response

    if (isApplication(data.serviceType)) {
      response = await applicationActionApi.deployApplication(data.applicationId, {
        git_commit_id: data.git_commit_id,
      })
    } else {
      response = await jobActionApi.deployJob(data.applicationId, undefined, {
        git_commit_id: data.git_commit_id,
      })
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      toast(ToastEnum.SUCCESS, 'Your application is deploying')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
  }
})

export const postApplicationActionsDeployByTag = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; tag: string; serviceType: ServiceTypeEnum }
>('applicationActions/deploy', async (data, { dispatch }) => {
  try {
    let response

    if (isContainer(data.serviceType)) {
      response = await containerActionApi.deployContainer(data.applicationId, {
        image_tag: data.tag,
      })
    } else {
      response = await jobActionApi.deployJob(data.applicationId, undefined, {
        image_tag: data.tag,
      })
    }

    if (response.status === 202) {
      // refetch status after update
      await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
      toast(ToastEnum.SUCCESS, `Your ${isJob(data.serviceType) ? 'job' : 'application'} is deploying`)
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
  }
})

export const postApplicationActionsStop = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum; withDeployments?: boolean }
>('applicationActions/stop', async (data, { dispatch }) => {
  try {
    let response
    if (isContainer(data.serviceType)) {
      response = await containerActionApi.stopContainer(data.applicationId)
    } else if (isJob(data.serviceType)) {
      response = await jobActionApi.stopJob(data.applicationId)
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
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Stopping error', (err as Error).message)
  }
})

export const deleteApplicationAction = createAsyncThunk<
  any,
  { environmentId: string; applicationId: string; serviceType?: ServiceTypeEnum }
>('applicationActions/delete', async (data, { dispatch }) => {
  try {
    let response
    if (isContainer(data.serviceType)) {
      response = await containerMainCallsApi.deleteContainer(data.applicationId)
    } else if (isJob(data.serviceType)) {
      response = await jobMainCallsApi.deleteJob(data.applicationId)
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
    return toast(ToastEnum.ERROR, 'Deleting error', (err as Error).message)
  }
})
