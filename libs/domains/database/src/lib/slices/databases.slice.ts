import {
  type PayloadAction,
  type Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { type QueryClient } from '@tanstack/react-query'
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
} from 'qovery-typescript-axios'
import { type DatabaseEntity, type DatabasesState, type LoadingStatus } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import {
  addOneToManyRelation,
  getEntitiesByIds,
  refactoDatabasePayload,
  removeOneToManyRelation,
  sortByKey,
} from '@qovery/shared/util-js'
import { type RootState } from '@qovery/state/store'
import { queries } from '@qovery/state/util-queries'

export const DATABASES_FEATURE_KEY = 'databases'

export const databasesAdapter = createEntityAdapter<DatabaseEntity>()

const databasesApi = new DatabasesApi()
const databaseMainCallsApi = new DatabaseMainCallsApi()
const databaseDeploymentsApi = new DatabaseDeploymentHistoryApi()
const databaseMetricsApi = new DatabaseMetricsApi()
const cloudProviderApi = new CloudProviderApi()

export const fetchDatabases = createAsyncThunk<Database[], { environmentId: string }>(
  'databases/fetch',
  async (data) => {
    const response = await databasesApi.listDatabase(data.environmentId)

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

export const fetchDatabase = createAsyncThunk<Database, { databaseId: string }>('database/fetch', async (data) => {
  const response = await databaseMainCallsApi.getDatabase(data.databaseId)

  return response.data
})

export const editDatabase = createAsyncThunk(
  'database/edit',
  async (payload: {
    databaseId: string
    data: DatabaseEntity
    toasterCallback: () => void
    queryClient: QueryClient
  }) => {
    const cloneDatabase = Object.assign({}, refactoDatabasePayload(payload.data) as DatabaseEntity)

    const response = await databaseMainCallsApi.editDatabase(payload.databaseId, cloneDatabase)

    if (response.data.environment?.id) {
      payload.queryClient.invalidateQueries({
        queryKey: queries.services.list(response.data.environment.id).queryKey,
      })
    }
    payload.queryClient.invalidateQueries({
      // NOTE: we don't care about the serviceType here because it's not related to cache
      queryKey: queries.services.details({ serviceId: payload.databaseId, serviceType: 'DATABASE' }).queryKey,
    })

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
  async (data: { environmentId: string; databaseId: string; force?: boolean; queryClient: QueryClient }) => {
    try {
      const response = await databaseMainCallsApi.deleteDatabase(data.databaseId)
      if (response.status === 204 || response.status === 200) {
        // success message
        toast(ToastEnum.SUCCESS, 'Your database is being deleted')
      }

      data.queryClient.invalidateQueries({
        queryKey: queries.services.list(data.environmentId).queryKey,
      })

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
