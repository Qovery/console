import { createAsyncThunk } from '@reduxjs/toolkit'
import { ApplicationActionsApi, ApplicationMainCallsApi } from 'qovery-typescript-axios'
import { fetchApplicationDeployments, fetchApplicationsStatus } from './applications.slice'
import { toast, ToastEnum } from '@console/shared/toast'

const applicationActionApi = new ApplicationActionsApi()
const applicationMainCallsApi = new ApplicationMainCallsApi()

export const postApplicationActionsRestart = createAsyncThunk<any, { environmentId: string; applicationId: string }>(
  'applicationActions/restart',
  async (data, { dispatch }) => {
    try {
      const response = await applicationActionApi.restartApplication(data.applicationId)
      if (response.status === 202) {
        // refetch status after update
        await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
        // refetch deployments after update
        await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is redeploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Redeploying error')
    }
  }
)

export const postApplicationActionsDeploy = createAsyncThunk<any, { environmentId: string; applicationId: string }>(
  'applicationActions/deploy',
  async (data, { dispatch }) => {
    try {
      const response = await applicationActionApi.restartApplication(data.applicationId)
      if (response.status === 202) {
        // refetch status after update
        await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
        // refetch deployments after update
        await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is deploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error')
    }
  }
)

export const postApplicationActionsStop = createAsyncThunk<any, { environmentId: string; applicationId: string }>(
  'applicationActions/stop',
  async (data, { dispatch }) => {
    try {
      const response = await applicationActionApi.stopApplication(data.applicationId)
      if (response.status === 202) {
        // refetch status after update
        await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
        // refetch deployments after update
        await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is stopping')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Stopping error')
    }
  }
)

export const deleteApplicationActionsStop = createAsyncThunk<any, { environmentId: string; applicationId: string }>(
  'applicationActions/delete',
  async (data, { dispatch }) => {
    try {
      const response = await applicationMainCallsApi.deleteApplication(data.applicationId)
      if (response.status === 204) {
        // refetch status after update
        await dispatch(fetchApplicationsStatus({ environmentId: data.environmentId }))
        // refetch deployments after update
        await dispatch(fetchApplicationDeployments({ applicationId: data.applicationId, silently: true }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your application is being deleted')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deleting error')
    }
  }
)
