import {
  type PayloadAction,
  type Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { type AxiosResponse } from 'axios'
import {
  CloudProviderApi,
  CloudProviderEnum,
  type Credentials,
  type Database,
  type DatabaseCurrentMetric,
  DatabaseDeploymentHistoryApi,
  DatabaseMainCallsApi,
  DatabaseMetricsApi,
  type DatabaseRequest,
  type DatabaseTypeEnum,
  DatabasesApi,
  type DeploymentHistoryDatabase,
  type ManagedDatabaseInstanceTypeResponseList,
  type Status,
} from 'qovery-typescript-axios'
import {
  type DatabaseEntity,
  type DatabasesState,
  type LoadingStatus,
  type ServiceRunningStatus,
} from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import {
  addOneToManyRelation,
  getEntitiesByIds,
  refactoDatabasePayload,
  removeOneToManyRelation,
  shortToLongId,
  sortByKey,
} from '@qovery/shared/utils'
import { type RootState } from '@qovery/state/store'

export const DATABASES_FEATURE_KEY = 'databases'

export const databasesAdapter = createEntityAdapter<DatabaseEntity>()

const databasesApi = new DatabasesApi()
const databaseMainCallsApi = new DatabaseMainCallsApi()
const databaseDeploymentsApi = new DatabaseDeploymentHistoryApi()
const databaseMetricsApi = new DatabaseMetricsApi()
const cloudProviderApi = new CloudProviderApi()

export const fetchDatabases = createAsyncThunk<Database[], { environmentId: string; withoutStatus?: boolean }>(
  'databases/fetch',
  async (data, thunkApi) => {
    const response = await databasesApi.listDatabase(data.environmentId)

    if (!data.withoutStatus) {
      thunkApi.dispatch(fetchDatabasesStatus({ environmentId: data.environmentId }))
    }

    return response.data.results as Database[]
  }
)

export const createDatabase = createAsyncThunk<Database, { environmentId: string; databaseRequest: DatabaseRequest }>(
  'databases/create',
  async (data) => {
    const response = await databasesApi.createDatabase(data.environmentId, data.databaseRequest)

    return response.data as DatabaseEntity
  }
)

/**
 * @deprecated This should be migrated to the new `use-status-web-sockets` hook
 */
export const fetchDatabasesStatus = createAsyncThunk<Status[], { environmentId: string }>(
  'databases-status/fetch',
  async (data) => {
    const response = await databasesApi.getEnvironmentDatabaseStatus(data.environmentId)

    return response.data.results as Status[]
  }
)

export const fetchDatabase = createAsyncThunk<Database, { databaseId: string }>('database/fetch', async (data) => {
  const response = await databaseMainCallsApi.getDatabase(data.databaseId)

  return response.data
})

export const editDatabase = createAsyncThunk(
  'database/edit',
  async (payload: { databaseId: string; data: DatabaseEntity; toasterCallback: () => void }) => {
    const cloneDatabase = Object.assign({}, refactoDatabasePayload(payload.data) as DatabaseEntity)

    const response = await databaseMainCallsApi.editDatabase(payload.databaseId, cloneDatabase)
    return response.data
  }
)

export const fetchDatabaseMetrics = createAsyncThunk<DatabaseCurrentMetric, { databaseId: string }>(
  'database/instances',
  async (data) => {
    const response = await databaseMetricsApi.getDatabaseCurrentMetric(data.databaseId)
    return response.data as DatabaseCurrentMetric
  }
)

export const fetchDatabaseDeployments = createAsyncThunk<
  DeploymentHistoryDatabase[],
  { databaseId: string; silently?: boolean }
>('database/deployments', async (data) => {
  // @todo remove response any update documentation
  const response = (await databaseDeploymentsApi.listDatabaseDeploymentHistory(data.databaseId)) as AxiosResponse<{
    page: number
    page_size: number
    results: DeploymentHistoryDatabase[]
  }>
  return response.data.results as DeploymentHistoryDatabase[]
})

export const fetchDatabaseMasterCredentials = createAsyncThunk<Credentials, { databaseId: string }>(
  'database/credentials',
  async (data) => {
    const response = await databaseMainCallsApi.getDatabaseMasterCredentials(data.databaseId)
    return response.data as Credentials
  }
)

export const deleteDatabaseAction = createAsyncThunk(
  'databaseActions/delete',
  async (data: { environmentId: string; databaseId: string; force?: boolean }, { dispatch }) => {
    try {
      const response = await databaseMainCallsApi.deleteDatabase(data.databaseId)
      if (response.status === 204 || response.status === 200) {
        // refetch status after update
        await dispatch(fetchDatabasesStatus({ environmentId: data.environmentId }))
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is being deleted')
      }

      return response
    } catch (err) {
      toast(ToastEnum.ERROR, 'Deleting error', (err as Error).message)
      return
    }
  }
)

export const fetchDatabaseInstanceTypes = createAsyncThunk<
  ManagedDatabaseInstanceTypeResponseList,
  { provider: CloudProviderEnum; region?: string; databaseType?: DatabaseTypeEnum }
>('database/instanceTypes', async (data) => {
  let response: AxiosResponse<ManagedDatabaseInstanceTypeResponseList>

  if (data.databaseType) {
    if (data.provider === CloudProviderEnum.AWS && data.region) {
      response = await cloudProviderApi.listAWSManagedDatabaseInstanceType(data.region, data.databaseType)
    } else {
      response = await cloudProviderApi.listSCWManagedDatabaseInstanceType(data.databaseType)
    }
  } else {
    throw new Error("The database type isn't defined.")
  }

  return response.data
})

export const initialDatabasesState: DatabasesState = databasesAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinEnvDatabase: {},
  statusLoadingStatus: 'not loaded',
})

export const databasesSlice = createSlice({
  name: DATABASES_FEATURE_KEY,
  initialState: initialDatabasesState,
  reducers: {
    add: databasesAdapter.addOne,
    remove: databasesAdapter.removeOne,
    /**
     * @deprecated This should be migrated to the new `use-status-web-sockets` hook
     */
    updateDatabasesRunningStatus: (
      state,
      action: PayloadAction<{ servicesRunningStatus: ServiceRunningStatus[]; listEnvironmentIdFromCluster: string[] }>
    ) => {
      // we have to force this reset change because of the way the socket works.
      // You can have information about an database (eg. if it's stopping)
      // But you can also lose the information about this database (eg. it it's stopped it won't appear in the socket result)
      const resetChanges: Update<DatabaseEntity>[] = state.ids.map((id) => {
        // as we can have this dispatch from different websocket, we don't want to reset
        // and override all the database but only the ones associated to the cluster the websocket is
        // coming from, more generally from all the environments that are contained in this cluster
        const envId = state.entities[id]?.environment?.id

        const runningStatusChanges =
          envId && action.payload.listEnvironmentIdFromCluster.includes(envId)
            ? undefined
            : state.entities[id]?.running_status
        return {
          id,
          changes: {
            running_status: runningStatusChanges,
          },
        }
      })
      databasesAdapter.updateMany(state, resetChanges)

      const changes: Update<DatabaseEntity>[] = action.payload.servicesRunningStatus.map((runningStatus) => {
        const realId = shortToLongId(runningStatus.id, state.ids as string[])
        return {
          id: realId,
          changes: {
            running_status: runningStatus,
          },
        }
      })

      databasesAdapter.updateMany(state, changes)
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all databases
      .addCase(fetchDatabases.pending, (state: DatabasesState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchDatabases.fulfilled, (state: DatabasesState, action: PayloadAction<Database[]>) => {
        databasesAdapter.upsertMany(state, action.payload)
        action.payload.forEach((database) => {
          state.joinEnvDatabase = addOneToManyRelation(database.environment?.id, database.id, {
            ...state.joinEnvDatabase,
          })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchDatabases.rejected, (state: DatabasesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      .addCase(fetchDatabase.pending, (state: DatabasesState) => {
        state.loadingStatus = 'loading'
      })
      // fetch database
      .addCase(fetchDatabase.fulfilled, (state: DatabasesState, action: PayloadAction<Database>) => {
        databasesAdapter.upsertOne(state, action.payload)
        state.joinEnvDatabase = addOneToManyRelation(action.payload.environment?.id, action.payload.id, {
          ...state.joinEnvDatabase,
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchDatabase.rejected, (state: DatabasesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      .addCase(deleteDatabaseAction.fulfilled, (state: DatabasesState, action) => {
        if (action.meta.arg.force) {
          databasesAdapter.removeOne(state, action.meta.arg.databaseId)
          state.joinEnvDatabase = removeOneToManyRelation(action.meta.arg.databaseId, {
            ...state.joinEnvDatabase,
          })
        }
      })
      // create
      .addCase(createDatabase.fulfilled, (state: DatabasesState, action) => {
        const database = action.payload
        databasesAdapter.addOne(state, database)
        state.error = null

        state.joinEnvDatabase = addOneToManyRelation(database.environment?.id, database.id, {
          ...state.joinEnvDatabase,
        })
        toast(ToastEnum.SUCCESS, `Your database ${action.payload.name} has been created`)
      })
      .addCase(createDatabase.rejected, (state: DatabasesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
      // edit database
      .addCase(editDatabase.pending, (state: DatabasesState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editDatabase.fulfilled, (state: DatabasesState, action) => {
        const update: Update<Database> = {
          id: action.meta.arg.databaseId,
          changes: {
            ...action.payload,
          },
        }
        databasesAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'

        toast(
          ToastEnum.SUCCESS,
          `Database updated`,
          'You must redeploy to apply the settings update',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(editDatabase.rejected, (state: DatabasesState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // get environments status
      .addCase(fetchDatabasesStatus.pending, (state: DatabasesState) => {
        state.statusLoadingStatus = 'loading'
      })
      .addCase(fetchDatabasesStatus.fulfilled, (state: DatabasesState, action: PayloadAction<Status[]>) => {
        const update: { id: string | undefined; changes: { status: Status } }[] = action.payload.map(
          (status: Status) => ({
            id: status.id,
            changes: {
              status: status,
            },
          })
        )
        databasesAdapter.updateMany(state, update as Update<Database>[])
        state.statusLoadingStatus = 'loaded'
      })
      .addCase(fetchDatabasesStatus.rejected, (state: DatabasesState, action) => {
        state.statusLoadingStatus = 'error'
        state.error = action.error.message
      })
      .addCase(fetchDatabaseMetrics.pending, (state: DatabasesState, action) => {
        const databaseId = action.meta.arg.databaseId
        const update: Update<DatabaseEntity> = {
          id: databaseId,
          changes: {
            metrics: {
              ...state.entities[databaseId]?.metrics,
              loadingStatus: 'loading',
            },
          },
        }
        databasesAdapter.updateOne(state, update)
      })
      .addCase(fetchDatabaseMetrics.fulfilled, (state: DatabasesState, action) => {
        const databaseId = action.meta.arg.databaseId
        const update: Update<DatabaseEntity> = {
          id: databaseId,
          changes: {
            metrics: {
              data: action.payload,
              loadingStatus: 'loaded',
            },
          },
        }
        databasesAdapter.updateOne(state, update)
      })
      .addCase(fetchDatabaseMetrics.rejected, (state: DatabasesState, action) => {
        const databaseId = action.meta.arg.databaseId
        const update: Update<DatabaseEntity> = {
          id: databaseId,
          changes: {
            metrics: {
              loadingStatus: 'error',
            },
          },
        }
        databasesAdapter.updateOne(state, update)

        state.error = action.error.message
        toastError(action.error)
      })
      .addCase(fetchDatabaseDeployments.pending, (state: DatabasesState, action) => {
        const update = {
          id: action.meta.arg.databaseId,
          changes: {
            deployments: {
              ...state.entities[action.meta.arg.databaseId]?.deployments,
              loadingStatus: action.meta.arg.silently ? 'loaded' : 'loading',
            },
          },
        }
        databasesAdapter.updateOne(state, update as Update<Database>)
      })
      .addCase(fetchDatabaseDeployments.fulfilled, (state: DatabasesState, action) => {
        const update = {
          id: action.meta.arg.databaseId,
          changes: {
            deployments: {
              loadingStatus: 'loaded',
              items: action.payload,
            },
          },
        }
        databasesAdapter.updateOne(state, update as Update<Database>)
      })
      .addCase(fetchDatabaseDeployments.rejected, (state: DatabasesState, action) => {
        const update = {
          id: action.meta.arg.databaseId,
          changes: {
            deployments: {
              loadingStatus: 'error',
            },
          },
        }
        databasesAdapter.updateOne(state, update as Update<Database>)
      })
      .addCase(fetchDatabaseMasterCredentials.pending, (state: DatabasesState, action) => {
        const update = {
          id: action.meta.arg.databaseId,
          changes: {
            credentials: {
              ...state.entities[action.meta.arg.databaseId]?.credentials,
              loadingStatus: 'loading',
            },
          },
        }
        databasesAdapter.updateOne(state, update as Update<Database>)
      })
      .addCase(fetchDatabaseMasterCredentials.fulfilled, (state: DatabasesState, action) => {
        const update = {
          id: action.meta.arg.databaseId,
          changes: {
            credentials: {
              loadingStatus: 'loaded',
              items: action.payload,
            },
          },
        }
        databasesAdapter.updateOne(state, update as Update<Database>)
      })
      .addCase(fetchDatabaseMasterCredentials.rejected, (state: DatabasesState, action) => {
        const update = {
          id: action.meta.arg.databaseId,
          changes: {
            credentials: {
              loadingStatus: 'error',
            },
          },
        }
        databasesAdapter.updateOne(state, update as Update<Database>)
      })
  },
})

export const databases = databasesSlice.reducer

export const databasesActions = databasesSlice.actions

const { selectAll } = databasesAdapter.getSelectors()

export const getDatabasesState = (rootState: RootState): DatabasesState => rootState[DATABASES_FEATURE_KEY]

export const selectAllDatabases = createSelector(getDatabasesState, selectAll)

export const selectDatabasesEntitiesByEnvId = (
  state: RootState,
  environmentId: string,
  sortBy: keyof DatabaseEntity = 'name'
): DatabaseEntity[] => {
  const databaseState = getDatabasesState(state)
  const entities = getEntitiesByIds<Database>(databaseState.entities, databaseState?.joinEnvDatabase[environmentId])
  return sortBy ? sortByKey<DatabaseEntity>(entities, sortBy) : entities
}

export const selectDatabaseById = (state: RootState, databaseId: string): DatabaseEntity | undefined =>
  getDatabasesState(state).entities[databaseId]

export const databasesLoadingStatus = (state: RootState): LoadingStatus => getDatabasesState(state).loadingStatus
