import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { type QueryClient } from '@tanstack/react-query'
import { type Database, type DatabaseRequest, DatabasesApi } from 'qovery-typescript-axios'
import { type DatabaseEntity, type DatabasesState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

export const DATABASES_FEATURE_KEY = 'databases'

export const databasesAdapter = createEntityAdapter<DatabaseEntity>()

const databasesApi = new DatabasesApi()

export const createDatabase = createAsyncThunk<
  Database,
  { environmentId: string; databaseRequest: DatabaseRequest; queryClient: QueryClient }
>('databases/create', async (data) => {
  const response = await databasesApi.createDatabase(data.environmentId, data.databaseRequest)

  data.queryClient.invalidateQueries({
    queryKey: queries.services.list(data.environmentId).queryKey,
  })

  return response.data as DatabaseEntity
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
  },
})

export const databases = databasesSlice.reducer

export const databasesActions = databasesSlice.actions
