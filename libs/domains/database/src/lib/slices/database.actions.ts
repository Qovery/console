import { createAsyncThunk } from '@reduxjs/toolkit'
import { DatabaseActionsApi } from 'qovery-typescript-axios'
import { fetchDatabasesStatus } from './databases.slice'
import { toast, ToastEnum } from '@console/shared/toast'

const databaseActionApi = new DatabaseActionsApi()

export const postDatabaseActionsRestart = createAsyncThunk<any, { environmentId: string; databaseId: string }>(
  'databaseActions/restart',
  async (data, { dispatch }) => {
    try {
      const response = await databaseActionApi.restartDatabase(data.databaseId)
      if (response.status === 202) {
        // refetch status after update
        await dispatch(fetchDatabasesStatus({ environmentId: data.environmentId }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is redeploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Redeploying error')
    }
  }
)

export const postDatabaseActionsDeploy = createAsyncThunk<any, { environmentId: string; databaseId: string }>(
  'databaseActions/deploy',
  async (data, { dispatch }) => {
    try {
      const response = await databaseActionApi.deployDatabase(data.databaseId)
      if (response.status === 202) {
        // refetch status after update
        await dispatch(fetchDatabasesStatus({ environmentId: data.environmentId }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is deploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error')
    }
  }
)

export const postDatabaseActionsStop = createAsyncThunk<any, { environmentId: string; databaseId: string }>(
  'databaseActions/stop',
  async (data, { dispatch }) => {
    try {
      const response = await databaseActionApi.stopDatabase(data.databaseId)
      if (response.status === 202) {
        // refetch status after update
        await dispatch(fetchDatabasesStatus({ environmentId: data.environmentId }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is stopping')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Stopping error')
    }
  }
)
