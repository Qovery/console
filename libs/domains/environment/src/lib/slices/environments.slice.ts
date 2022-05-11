import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit'
import { Environment, EnvironmentsApi, Status } from 'qovery-typescript-axios'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environmentsApi = new EnvironmentsApi()

export interface EnvironmentsState
  extends EntityState<
    Environment & {
      status?: Status
    }
  > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinProjectEnvironments: Record<string, string[]>
}

export const environmentsAdapter = createEntityAdapter<Environment>()

export const fetchEnvironments = createAsyncThunk<any, { projectId: string }>('environments/fetch', async (data) => {
  const response = await environmentsApi.listEnvironment(data.projectId).then((response) => response.data)
  return response.results as Environment[]
})

export const fetchEnvironmentsStatus = createAsyncThunk<any, { projectId: string }>(
  'environments-status/fetch',
  async (data) => {
    const response = await environmentsApi
      .getProjectEnvironmentStatus(data.projectId)
      .then((response: any) => response.data)
    return response.results as Status[]
  }
)

export const initialEnvironmentsState: EnvironmentsState = environmentsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinProjectEnvironments: {},
})

export const environmentsSlice = createSlice({
  name: ENVIRONMENTS_FEATURE_KEY,
  initialState: initialEnvironmentsState,
  reducers: {
    add: environmentsAdapter.addOne,
    remove: environmentsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      // get environments
      .addCase(fetchEnvironments.pending, (state: EnvironmentsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchEnvironments.fulfilled, (state: EnvironmentsState, action: PayloadAction<Environment[]>) => {
        environmentsAdapter.upsertMany(state, action.payload)
        action.payload.forEach((environment) => {
          state.joinProjectEnvironments = addOneToManyRelation(environment.project?.id, environment.id, {
            ...state.joinProjectEnvironments,
          })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchEnvironments.rejected, (state: EnvironmentsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // get environments status
      .addCase(fetchEnvironmentsStatus.pending, (state: EnvironmentsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchEnvironmentsStatus.fulfilled, (state: EnvironmentsState, action: PayloadAction<Status[]>) => {
        const update: { id: string | undefined; changes: { status: Status } }[] = action.payload.map(
          (status: Status) => ({
            id: status.id,
            changes: {
              status: status,
            },
          })
        )
        environmentsAdapter.updateMany(state, update as Update<Environment>[])
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchEnvironmentsStatus.rejected, (state: EnvironmentsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const environments = environmentsSlice.reducer

export const environmentsActions = environmentsSlice.actions

const { selectAll, selectEntities } = environmentsAdapter.getSelectors()

export const getEnvironmentsState = (rootState: any): EnvironmentsState => rootState[ENVIRONMENTS_FEATURE_KEY]

export const selectAllEnvironments = createSelector(getEnvironmentsState, selectAll)

export const selectEnvironmentsEntities = createSelector(getEnvironmentsState, selectEntities)

export const selectEnvironmentsEntitiesByProjectId = (state: any, projectId: string): Environment[] => {
  state = getEnvironmentsState(state)
  return getEntitiesByIds<Environment>(state.entities, state?.joinProjectEnvironments[projectId])
}

export const selectEnvironmentById = (state: any, environmentId: string) =>
  getEnvironmentsState(state).entities[environmentId]
