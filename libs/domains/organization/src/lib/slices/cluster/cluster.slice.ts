import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
  CloudProvider,
  CloudProviderApi,
  Cluster,
  ClusterAdvancedSettings,
  ClusterCloudProviderInfo,
  ClusterCloudProviderInfoRequest,
  ClusterLogs,
  ClusterRequest,
  ClusterStatus,
  ClustersApi,
} from 'qovery-typescript-axios'
import { AdvancedSettings, ClusterEntity, ClustersState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds, refactoClusterPayload } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const CLUSTER_FEATURE_KEY = 'cluster'

const clusterApi = new ClustersApi()
const cloudProviderApi = new CloudProviderApi()

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

export const editCluster = createAsyncThunk(
  'cluster/edit',
  async (payload: { organizationId: string; clusterId: string; data: Partial<ClusterEntity> }) => {
    const cloneCluster = Object.assign({}, refactoClusterPayload(payload.data as Partial<ClusterEntity>))
    const response = await clusterApi.editCluster(
      payload.organizationId,
      payload.clusterId,
      cloneCluster as ClusterRequest
    )

    return response.data as ClusterEntity
  }
)

export const editClusterAdvancedSettings = createAsyncThunk<
  ClusterAdvancedSettings,
  {
    organizationId: string
    clusterId: string
    settings: ClusterAdvancedSettings
    toasterCallback: () => void
  }
>('cluster/advancedSettings/edit', async (data) => {
  const response = await clusterApi.editClusterAdvancedSettings(
    data.organizationId,
    data.clusterId,
    data.settings as ClusterAdvancedSettings
  )

  return response.data as ClusterAdvancedSettings
})

export const fetchDefaultClusterAdvancedSettings = createAsyncThunk<AdvancedSettings>(
  'cluster/defaultAdvancedSettings',
  async () => {
    const response = await clusterApi.getDefaultClusterAdvancedSettings()
    return response.data
  }
)

export const fetchClusterAdvancedSettings = createAsyncThunk<
  ClusterAdvancedSettings,
  { organizationId: string; clusterId: string }
>('cluster/advancedSettings', async (data) => {
  const response = await clusterApi.getClusterAdvancedSettings(data.organizationId, data.clusterId)
  return response.data as ClusterAdvancedSettings
})

export const fetchCloudProvider = createAsyncThunk<CloudProvider[]>('cluster-cloud-provider/fetch', async () => {
  const response = await cloudProviderApi.listCloudProvider()
  return response.data.results as CloudProvider[]
})

export const fetchCloudProviderInfo = createAsyncThunk<
  ClusterCloudProviderInfo,
  { organizationId: string; clusterId: string }
>('cluster-cloud-provider-info/fetch', async (data) => {
  const response = await clusterApi.getOrganizationCloudProviderInfo(data.organizationId, data.clusterId)
  return response.data as ClusterCloudProviderInfo
})

export const postCloudProviderInfo = createAsyncThunk<
  ClusterCloudProviderInfo,
  { organizationId: string; clusterId: string; clusterCloudProviderInfo: ClusterCloudProviderInfoRequest }
>('cluster-cloud-provider-info/post', async (data) => {
  const response = await clusterApi.specifyClusterCloudProviderInfo(
    data.organizationId,
    data.clusterId,
    data.clusterCloudProviderInfo
  )
  return response.data as ClusterCloudProviderInfoRequest
})

export const initialClusterState: ClustersState = clusterAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinOrganizationClusters: {},
  statusLoadingStatus: 'not loaded',
  defaultClusterAdvancedSettings: {
    loadingStatus: 'not loaded',
    settings: undefined,
  },
  cloudProvider: {
    loadingStatus: 'not loaded',
    items: [],
  },
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
      // edit cluster
      .addCase(editCluster.pending, (state: ClustersState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editCluster.fulfilled, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            ...action.payload,
          },
        }
        clusterAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'

        toast(ToastEnum.SUCCESS, 'Cluster updated')
      })
      .addCase(editCluster.rejected, (state: ClustersState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // default advanced settings
      .addCase(fetchDefaultClusterAdvancedSettings.pending, (state: ClustersState, action) => {
        state.defaultClusterAdvancedSettings.settings = action.payload
      })
      .addCase(fetchDefaultClusterAdvancedSettings.fulfilled, (state: ClustersState, action) => {
        state.defaultClusterAdvancedSettings.settings = action.payload
        state.defaultClusterAdvancedSettings.loadingStatus = 'loaded'
      })
      .addCase(fetchDefaultClusterAdvancedSettings.rejected, (state: ClustersState, action) => {
        state.defaultClusterAdvancedSettings.loadingStatus = 'error'
      })
      // fetch cluster advanced settings
      .addCase(fetchClusterAdvancedSettings.pending, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loading',
              current_settings: undefined,
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(fetchClusterAdvancedSettings.fulfilled, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loaded',
              current_settings: action.payload,
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(fetchClusterAdvancedSettings.rejected, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            advanced_settings: {
              loadingStatus: 'error',
              current_settings: undefined,
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      // edit cluster advanced settings
      .addCase(editClusterAdvancedSettings.pending, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loading',
              current_settings: state.entities[clusterId]?.advanced_settings?.current_settings,
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(editClusterAdvancedSettings.fulfilled, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            advanced_settings: {
              loadingStatus: 'loaded',
              current_settings: action.payload,
            },
          },
        }
        toast(
          ToastEnum.SUCCESS,
          `Cluster updated`,
          'You must update to apply the settings',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
        clusterAdapter.updateOne(state, update)
      })
      .addCase(editClusterAdvancedSettings.rejected, (state: ClustersState, action) => {
        const clusterId = action.meta.arg.clusterId
        const update: Update<ClusterEntity> = {
          id: clusterId,
          changes: {
            advanced_settings: {
              loadingStatus: 'error',
              current_settings: state.entities[clusterId]?.advanced_settings?.current_settings,
            },
          },
        }

        toast(
          ToastEnum.ERROR,
          `Your advanced settings have not been updated. Something must be wrong with the values provided`
        )
        clusterAdapter.updateOne(state, update)
      })
      // cloud provider
      .addCase(fetchCloudProvider.pending, (state: ClustersState) => {
        state.cloudProvider.loadingStatus = 'loading'
      })
      .addCase(fetchCloudProvider.fulfilled, (state: ClustersState, action: PayloadAction<CloudProvider[]>) => {
        state.cloudProvider.items = action.payload
        state.cloudProvider.loadingStatus = 'loaded'
      })
      .addCase(fetchCloudProvider.rejected, (state: ClustersState) => {
        state.cloudProvider.loadingStatus = 'error'
      })
      // fetch cloud provider info
      .addCase(fetchCloudProviderInfo.fulfilled, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            cloudProviderInfo: {
              loadingStatus: 'loaded',
              item: action.payload,
            },
          },
        }
        clusterAdapter.updateOne(state, update)
      })
      .addCase(fetchCloudProviderInfo.rejected, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            cloudProviderInfo: {
              loadingStatus: 'error',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
        toastError(action.error)
      })
      // post cloud provider info
      .addCase(postCloudProviderInfo.fulfilled, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            cloudProviderInfo: {
              loadingStatus: 'loading',
              item: action.payload,
            },
          },
        }
        clusterAdapter.updateOne(state, update)
        toast(ToastEnum.SUCCESS, 'Credentials updated')
      })
      .addCase(postCloudProviderInfo.rejected, (state: ClustersState, action) => {
        const update: Update<ClusterEntity> = {
          id: action.meta.arg.clusterId,
          changes: {
            extendedStatus: {
              loadingStatus: 'error',
            },
          },
        }
        clusterAdapter.updateOne(state, update)
        toastError(action.error)
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
