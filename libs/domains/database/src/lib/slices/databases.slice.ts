import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit'
import { Database, DatabasesApi, Status } from 'qovery-typescript-axios'
import { DatabaseEntity, DatabasesState, LoadingStatus, ServiceRunningStatus } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds, shortToLongId } from '@console/shared/utils'
import { RootState } from '@console/store/data'

export const DATABASES_FEATURE_KEY = 'databases'

export const databasesAdapter = createEntityAdapter<DatabaseEntity>()

const databasesApi = new DatabasesApi()

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

export const fetchDatabasesStatus = createAsyncThunk<Status[], { environmentId: string }>(
  'databases-status/fetch',
  async (data) => {
    const response = await databasesApi.getEnvironmentDatabaseStatus(data.environmentId)
    return response.data.results as Status[]
  }
)

export const initialDatabasesState: DatabasesState = databasesAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinEnvDatabase: {},
})

export const databasesSlice = createSlice({
  name: DATABASES_FEATURE_KEY,
  initialState: initialDatabasesState,
  reducers: {
    add: databasesAdapter.addOne,
    remove: databasesAdapter.removeOne,
    updateDatabasessRunningStatus: (
      state,
      action: PayloadAction<{ servicesRunningStatus: ServiceRunningStatus[]; listEnvironmentIdFromCluster: string[] }>
    ) => {
      // we have to force this reset change because of the way the socket works.
      // You can have information about an application (eg. if it's stopping)
      // But you can also lose the information about this application (eg. it it's stopped it won't appear in the socket result)
      const resetChanges: Update<DatabaseEntity>[] = state.ids.map((id) => {
        // as we can have this dispatch from different websocket, we don't want to reset
        // and override all the application but only the ones associated to the cluster the websocket is
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
      // get environments status
      .addCase(fetchDatabasesStatus.pending, (state: DatabasesState) => {
        state.loadingStatus = 'loading'
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
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchDatabasesStatus.rejected, (state: DatabasesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const databases = databasesSlice.reducer

export const databasesActions = databasesSlice.actions

const { selectAll } = databasesAdapter.getSelectors()

export const getDatabasesState = (rootState: RootState): DatabasesState => rootState['entities'][DATABASES_FEATURE_KEY]

export const selectAllDatabases = createSelector(getDatabasesState, selectAll)

export const selectDatabasesEntitiesByEnvId = (state: RootState, environmentId: string): DatabaseEntity[] => {
  const databaseState = getDatabasesState(state)
  return getEntitiesByIds<Database>(databaseState.entities, databaseState?.joinEnvDatabase[environmentId])
}

export const selectDatabaseById = (state: RootState, databaseId: string): DatabaseEntity | undefined =>
  getDatabasesState(state).entities[databaseId]

export const databasesLoadingStatus = (state: RootState): LoadingStatus => getDatabasesState(state).loadingStatus
