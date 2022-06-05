import { ClustersState } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Cluster, ClustersApi } from 'qovery-typescript-axios'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'

export const CLUSTER_FEATURE_KEY = 'cluster'

const clusterApi = new ClustersApi()

export const clusterAdapter = createEntityAdapter<Cluster>()

export const fetchClusters = createAsyncThunk<Cluster[], { organizationId: string }>('cluster/fetch', async (data) => {
  const response = await clusterApi.listOrganizationCluster(data.organizationId)
  return response.data.results as Cluster[]
})

export const initialClusterState: ClustersState = clusterAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinOrganizationClusters: {},
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
  },
})

export const clusterReducer = clusterSlice.reducer

export const clusterActions = clusterSlice.actions

const { selectAll, selectEntities } = clusterAdapter.getSelectors()

export const getClusterState = (rootState: RootState): ClustersState => rootState.entities[CLUSTER_FEATURE_KEY]

export const selectAllCluster = createSelector(getClusterState, selectAll)

export const selectClustersEntitiesByOrganizationId = (state: RootState, organizationId: string): Cluster[] => {
  const clusterState = getClusterState(state)
  return getEntitiesByIds<Cluster>(clusterState.entities, clusterState?.joinOrganizationClusters[organizationId])
}

export const selectClusterEntities = createSelector(getClusterState, selectEntities)
