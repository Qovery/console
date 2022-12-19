import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { Cluster, ClusterLogs, ClusterStatus, ClustersApi } from 'qovery-typescript-axios'
import { ClusterEntity, ClustersState } from '@qovery/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const CLUSTER_FEATURE_KEY = 'cluster'

const clusterApi = new ClustersApi()

export const clusterAdapter = createEntityAdapter<ClusterEntity>()

export const fetchClusters = createAsyncThunk<Cluster[], { organizationId: string }>('cluster/fetch', async (data) => {
  const response = await clusterApi.listOrganizationCluster(data.organizationId)
  return response.data.results as Cluster[]
})

export const fetchClusterStatus = createAsyncThunk<ClusterStatus, { organizationId: string; clusterId: string }>(
  'cluster-status/fetch',
  async (data) => {
    const response = await clusterApi.getClusterStatus(data.organizationId, data.clusterId)
    return response.data as ClusterStatus
  }
)

export const fetchClustersStatus = createAsyncThunk<ClusterStatus[], { organizationId: string }>(
  'clusters-status/fetch',
  async (data) => {
    const response = await clusterApi.getOrganizationClusterStatus(data.organizationId)
    return response.data.results as ClusterStatus[]
  }
)

export const fetchClusterInfraLogs = createAsyncThunk<ClusterLogs[], { organizationId: string; clusterId: string }>(
  'cluster-infra-logs/fetch',
  async (data) => {
    const response = await clusterApi.listClusterLogs(data.organizationId, data.clusterId)
    return response.data.results as ClusterLogs[]
  }
)

export const initialClusterState: ClustersState = clusterAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinOrganizationClusters: {},
  statusLoadingStatus: 'not loaded',
})

export const clusterSlice = createSlice({
  name: CLUSTER_FEATURE_KEY,
  initialState: initialClusterState,
  reducers: {
    add: clusterAdapter.addOne,
    remove: clusterAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClusters.pending, (state: ClustersState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchClusters.fulfilled, (state: ClustersState, action) => {
        clusterAdapter.upsertMany(state, action.payload)
        action.payload.forEach((cluster) => {
          state.joinOrganizationClusters = addOneToManyRelation(action.meta.arg.organizationId, cluster.id, {
            ...state.joinOrganizationClusters,
          })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchClusters.rejected, (state: ClustersState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // fetch cluster status
      .addCase(fetchClusterStatus.pending, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            extendedStatus: {
              ...state.entities[clusterId]?.extendedStatus,
              loadingStatus: 'loading',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(fetchClusterStatus.fulfilled, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            extendedStatus: {
              status: action.payload,
              loadingStatus: 'loaded',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(fetchClusterStatus.rejected, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            extendedStatus: {
              loadingStatus: 'error',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      // fetch clusters status
      .addCase(fetchClustersStatus.pending, (state: ClustersState) => {
        state.statusLoadingStatus = 'loading'
      })
      .addCase(fetchClustersStatus.fulfilled, (state: ClustersState, action: PayloadAction<ClusterStatus[]>) => {
        const update = action.payload.map((status: ClusterStatus) => ({
          id: status.cluster_id,
          changes: {
            extendedStatus: {
              status: status,
              loadingStatus: 'loaded',
            },
          },
        }))
        clusterAdapter.updateMany(state, update as Update<Cluster>[])
        state.statusLoadingStatus = 'loaded'
      })
      .addCase(fetchClustersStatus.rejected, (state: ClustersState, action) => {
        state.error = action.error.message
        state.statusLoadingStatus = 'error'
      })
      // fetch cluster logs
      .addCase(fetchClusterInfraLogs.pending, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            logs: {
              ...state.entities[clusterId]?.logs,
              loadingStatus: 'loading',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(fetchClusterInfraLogs.fulfilled, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            logs: {
              items: action.payload,
              loadingStatus: 'loaded',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(fetchClusterInfraLogs.rejected, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            logs: {
              loadingStatus: 'error',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
  },
})

export const clusterReducer = clusterSlice.reducer

export const clusterActions = clusterSlice.actions

const { selectAll, selectEntities } = clusterAdapter.getSelectors()

export const getClusterState = (rootState: RootState): ClustersState => rootState[CLUSTER_FEATURE_KEY]

export const selectAllCluster = createSelector(getClusterState, selectAll)

export const selectClustersEntitiesByOrganizationId = createSelector(
  [getClusterState, (state, organizationId: string) => organizationId],
  (items, organizationId) => {
    return getEntitiesByIds<Cluster>(items.entities, items?.joinOrganizationClusters[organizationId])
  }
)

export const selectClustersStatusLoadingStatus = createSelector(getClusterState, (state) => state.statusLoadingStatus)

export const selectClustersLoadingStatus = createSelector(getClusterState, (state) => state.loadingStatus)

export const selectClusterEntities = createSelector(getClusterState, selectEntities)

export const selectClusterById = (state: RootState, applicationId: string): ClusterEntity | undefined =>
  getClusterState(state).entities[applicationId]
