import { createAsyncThunk } from '@reduxjs/toolkit'
import { ClustersApi } from 'qovery-typescript-axios'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { fetchClusterStatus } from './cluster.slice'

const clusterApi = new ClustersApi()

export const postClusterActionsUpdate = createAsyncThunk<any, { organizationId: string; clusterId: string }>(
  'clusterActions/update',
  async (data, { dispatch }) => {
    try {
      const response = await clusterApi.updateCluster(data.organizationId, data.clusterId)
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

export const postClusterActionsDeploy = createAsyncThunk<any, { organizationId: string; clusterId: string }>(
  'clusterActions/deploy',
  async (data, { dispatch }) => {
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

export const postClusterActionsStop = createAsyncThunk<any, { organizationId: string; clusterId: string }>(
  'clusterActions/stop',
  async (data, { dispatch }) => {
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

export const deleteClusterAction = createAsyncThunk<any, { organizationId: string; clusterId: string }>(
  'clusterActions/delete',
  async (data, { dispatch }) => {
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
