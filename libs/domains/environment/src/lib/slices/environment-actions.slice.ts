import { createAsyncThunk } from '@reduxjs/toolkit'
import { EnvironmentActionsApi } from 'qovery-typescript-axios'
import { fetchEnvironmentsStatus } from './environments.slice'
import { toast, ToastEnum } from '@console/shared/toast'

export const ENVIRONMENT_ACTIONS_FEATURE_KEY = 'environmentActions'

const environmentActionApi = new EnvironmentActionsApi()

export const postEnvironmentActionsRestart = createAsyncThunk<any, { projectId: string; environmentId: string }>(
  'environmentActions/restart',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await environmentActionApi.restartEnvironment(data.environmentId).then(async (response) => {
        if (response.status === 200) {
          // refetch status after update
          await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
          // success message
          toast(ToastEnum.SUCCESS, 'Success!', 'Your environment is redeploying')
        }
        return response.data
      })

      return response
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const postEnvironmentActionsDeploy = createAsyncThunk<any, { projectId: string; environmentId: string }>(
  'environmentActions/deploy',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await environmentActionApi.deployEnvironment(data.environmentId).then(async (response) => {
        if (response.status === 200) {
          // refetch status after update
          await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
          // success message
          toast(ToastEnum.SUCCESS, 'Success!', 'Your environment is deploying')
        }
        return response.data
      })

      return response
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const postEnvironmentActionsStop = createAsyncThunk<any, { projectId: string; environmentId: string }>(
  'environmentActions/stop',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await environmentActionApi.stopEnvironment(data.environmentId).then(async (response) => {
        if (response.status === 200) {
          // refetch status after update
          await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
          // success message
          toast(ToastEnum.SUCCESS, 'Success!', 'Your environment is stopping')
        }
        return response.data
      })

      return response
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const postEnvironmentActionsCancelDeployment = createAsyncThunk<
  any,
  { projectId: string; environmentId: string }
>('environmentActions/cancel-deployment', async (data, { rejectWithValue, dispatch }) => {
  try {
    const response = await environmentActionApi
      .cancelEnvironmentDeployment(data.environmentId)
      .then(async (response) => {
        if (response.status === 200) {
          // refetch status after update
          await dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
          // success message
          toast(ToastEnum.SUCCESS, 'Success!', 'Your environment deployment is cancelling')
        }
        return response.data
      })

    return response
  } catch (err) {
    return rejectWithValue(err)
  }
})
