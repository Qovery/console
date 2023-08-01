import { createAsyncThunk } from '@reduxjs/toolkit'
import { ClustersApi } from 'qovery-typescript-axios'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { fetchClusterStatus } from './cluster.slice'

const clusterApi = new ClustersApi()

export const postClusterActionsUpdate = createAsyncThunk(
  'clusterActions/update',
  async (data: { organizationId: string; clusterId: string }, { dispatch }) => {
    try {
      const response = await clusterApi.editCluster(data.organizationId, data.clusterId)
      if (response.status === 202 || response.status === 200) {
        // refetch status after update
        await dispatch(fetchClusterStatus({ organizationId: data.organizationId, clusterId: data.clusterId }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your cluster is updating')
      }

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Redeploying error', (err as Error).message)
    }
  }
)

export const postClusterActionsDeploy = createAsyncThunk(
  'clusterActions/deploy',
  async (data: { organizationId: string; clusterId: string }, { dispatch }) => {
    try {
      const response = await clusterApi.deployCluster(data.organizationId, data.clusterId)
      if (response.status === 202 || response.status === 200) {
        // refetch status after update
        await dispatch(fetchClusterStatus({ organizationId: data.organizationId, clusterId: data.clusterId }))
      }
      // success message
      toast(ToastEnum.SUCCESS, 'Your cluster is deploying')

      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Deploying error', (err as Error).message)
    }
  }
)

export const postClusterActionsStop = createAsyncThunk(
  'clusterActions/stop',
  async (data: { organizationId: string; clusterId: string }, { dispatch }) => {
    try {
      const response = await clusterApi.stopCluster(data.organizationId, data.clusterId)
      if (response.status === 202 || response.status === 200) {
        // refetch status after update
        await dispatch(fetchClusterStatus({ organizationId: data.organizationId, clusterId: data.clusterId }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your cluster is stopping')
      }
      return response
    } catch (err) {
      // error message
      return toast(ToastEnum.ERROR, 'Stopping error', (err as Error).message)
    }
  }
)

export const deleteClusterAction = createAsyncThunk(
  'clusterActions/delete',
  async (data: { organizationId: string; clusterId: string }, { dispatch }) => {
    try {
      const response = await clusterApi.deleteCluster(data.organizationId, data.clusterId)
      if (response.status === 204 || response.status === 200) {
        // refetch status after update
        await dispatch(fetchClusterStatus({ organizationId: data.organizationId, clusterId: data.clusterId }))

        // success message
        toast(ToastEnum.SUCCESS, 'Your cluster is being deleted')
      }

      return response
    } catch (err) {
      return toast(ToastEnum.ERROR, 'Deleting error', (err as Error).message)
    }
  }
)
