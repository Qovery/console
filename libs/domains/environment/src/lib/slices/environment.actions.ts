import { createAsyncThunk } from '@reduxjs/toolkit'
import { EnvironmentActionsApi, EnvironmentMainCallsApi } from 'qovery-typescript-axios'
import { fetchEnvironmentDeploymentHistory, fetchEnvironmentsStatus } from './environments.slice'
import { toast, ToastEnum } from '@console/shared/toast'

const environmentActionApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()

export const postEnvironmentActionsRestart = createAsyncThunk<any, { projectId: string; environmentId: string }>(
  'environmentActions/restart',
  async (data, { dispatch }) => {
    try {
      const response = await environmentActionApi.restartEnvironment(data.environmentId)
      if (response.status === 200) {
        // refetch status after update
        await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
        // refresh deployments after update
        await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your environment is redeploying')
      }
      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Redeploying error')
    }
  }
)

export const postEnvironmentActionsDeploy = createAsyncThunk<any, { projectId: string; environmentId: string }>(
  'environmentActions/deploy',
  async (data, { dispatch }) => {
    try {
      const response = await environmentActionApi.deployEnvironment(data.environmentId)
      if (response.status === 200) {
        // refetch status after update
        await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
        // refresh deployments after update
        await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your environment is deploying')
      }
      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error')
    }
  }
)

export const postEnvironmentActionsStop = createAsyncThunk<any, { projectId: string; environmentId: string }>(
  'environmentActions/stop',
  async (data, { dispatch }) => {
    try {
      const response = await environmentActionApi.stopEnvironment(data.environmentId)
      if (response.status === 200) {
        // refetch status after update
        await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
        // refresh deployments after update
        await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your environment is stopping')
      }
      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Stopping error')
    }
  }
)

export const postEnvironmentActionsCancelDeployment = createAsyncThunk<
  any,
  { projectId: string; environmentId: string }
>('environmentActions/cancel-deployment', async (data, { dispatch }) => {
  try {
    const response = await environmentActionApi.cancelEnvironmentDeployment(data.environmentId)
    if (response.status === 200) {
      // refetch status after update
      await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
      // refresh deployments after update
      await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your environment deployment is cancelling')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Cancelling error')
  }
})

export const deleteEnvironmentActionsCancelDeployment = createAsyncThunk<
  any,
  { projectId: string; environmentId: string }
>('environmentActions/delete', async (data, { dispatch }) => {
  try {
    const response = await environmentMainCallsApi.deleteEnvironment(data.environmentId)
    if (response.status === 204) {
      // refetch status after update
      await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
      // refresh deployments after update
      await dispatch(fetchEnvironmentDeploymentHistory({ environmentId: data.environmentId, silently: true }))
      // success message
      toast(ToastEnum.SUCCESS, 'Your environment is being deleted')
    }

    return response
  } catch (err) {
    // error message
    return toast(ToastEnum.ERROR, 'Deleting error')
  }
})
