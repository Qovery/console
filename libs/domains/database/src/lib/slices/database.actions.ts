import { createAsyncThunk } from '@reduxjs/toolkit'
import { DatabaseActionsApi } from 'qovery-typescript-axios'
import { ToastEnum, toast } from '@qovery/shared/ui'

const databaseActionApi = new DatabaseActionsApi()

export const postDatabaseActionsRedeploy = createAsyncThunk(
  'databaseActions/redeploy',
  async (data: { environmentId: string; databaseId: string }) => {
    try {
      const response = await databaseActionApi.redeployDatabase(data.databaseId)
      if (response.status === 202 || response.status === 200) {
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is redeploying')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Redeploying error', (err as Error).message)
    }
  }
)

export const postDatabaseActionsReboot = createAsyncThunk(
  'databaseActions/reboot',
  async (data: { environmentId: string; databaseId: string }) => {
    try {
      const response = await databaseActionApi.rebootDatabase(data.databaseId)
      if (response.status === 202 || response.status === 200) {
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is restarting')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Restarting error', (err as Error).message)
    }
  }
)

export const postDatabaseActionsDeploy = createAsyncThunk(
  'databaseActions/deploy',
  async (data: { environmentId: string; databaseId: string }) => {
    try {
      const response = await databaseActionApi.deployDatabase(data.databaseId)
      // success message
      toast(ToastEnum.SUCCESS, 'Your database is deploying')

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
    }
  }
)

export const postDatabaseActionsStop = createAsyncThunk(
  'databaseActions/stop',
  async (data: { environmentId: string; databaseId: string }) => {
    try {
      const response = await databaseActionApi.stopDatabase(data.databaseId)
      if (response.status === 202 || response.status === 200) {
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is stopping')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Stopping error', (err as Error).message)
    }
  }
)
