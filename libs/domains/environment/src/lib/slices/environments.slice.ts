import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit'
import { EnvironmentEntity, EnvironmentsState, WebsocketRunningStatusInterface } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds, shortToLongId } from '@console/shared/utils'
import {
  DeploymentHistoryEnvironment,
  Environment,
  EnvironmentDeploymentHistoryApi,
  EnvironmentsApi,
  Status,
} from 'qovery-typescript-axios'
import { RootState } from '@console/store/data'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environmentsApi = new EnvironmentsApi()
const environmentDeploymentsApi = new EnvironmentDeploymentHistoryApi()

export const environmentsAdapter = createEntityAdapter<EnvironmentEntity>()

export const fetchEnvironments = createAsyncThunk<Environment[], { projectId: string; withoutStatus?: boolean }>(
  'environments/fetch',
  async (data, thunkApi) => {
    const response = await environmentsApi.listEnvironment(data.projectId)

    if (!data.withoutStatus) {
      thunkApi.dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
    }

    return response.data.results as Environment[]
  }
)

export const fetchEnvironmentsStatus = createAsyncThunk<Status[], { projectId: string }>(
  'environments-status/fetch',
  async (data) => {
    const response = await environmentsApi.getProjectEnvironmentsStatus(data.projectId)
    return response.data.results as Status[]
  }
)

export const fetchEnvironmentDeploymentHistory = createAsyncThunk<
  DeploymentHistoryEnvironment[],
  { environmentId: string }
>('environments-deployments/fetch', async (data) => {
  const response = await environmentDeploymentsApi.listEnvironmentDeploymentHistory(data.environmentId)
  return response.data.results as DeploymentHistoryEnvironment[]
})

export const initialEnvironmentsState: EnvironmentsState = environmentsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  loadingEnvironmentStatus: 'not loaded',
  loadingEnvironmentDeployments: 'not loaded',
  error: null,
  joinProjectEnvironments: {},
})

export const environmentsSlice = createSlice({
  name: ENVIRONMENTS_FEATURE_KEY,
  initialState: initialEnvironmentsState,
  reducers: {
    add: environmentsAdapter.addOne,
    remove: environmentsAdapter.removeOne,
    updateEnvironmentsRunningStatus: (
      state,
      action: PayloadAction<{ websocketRunningStatus: WebsocketRunningStatusInterface[]; clusterId: string }>
    ) => {
      // we have to force this reset change because of the way the socket works.
      // You can have information about an application (eg. if it's stopping)
      // But you can also lose the information about this application (eg. it it's stopped it won't appear in the socket result)
      const resetChanges: Update<EnvironmentEntity>[] = state.ids.map((id) => {
        // as we can have this dispatch from different websocket, we don't want to reset
        // and override all the entry but only the one associated to the cluster the websocket is
        // coming from
        const runningStatusChanges =
          state.entities[id]?.cluster_id === action.payload.clusterId ? undefined : state.entities[id]?.running_status
        return {
          id,
          changes: {
            running_status: runningStatusChanges,
          },
        }
      })
      environmentsAdapter.updateMany(state, resetChanges)

      const changes: Update<EnvironmentEntity>[] = action.payload.websocketRunningStatus.map((runningStatus) => {
        const realId = shortToLongId(runningStatus.id, state.ids as string[])
        return {
          id: realId,
          changes: {
            running_status: runningStatus,
          },
        }
      })

      environmentsAdapter.updateMany(state, changes)
    },
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
        state.loadingEnvironmentStatus = 'loading'
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
        state.loadingEnvironmentStatus = 'loaded'
      })
      .addCase(fetchEnvironmentsStatus.rejected, (state: EnvironmentsState, action) => {
        state.loadingEnvironmentStatus = 'error'
        state.error = action.error.message
      })
      // get environment deployment history
      .addCase(fetchEnvironmentDeploymentHistory.pending, (state: EnvironmentsState) => {
        state.loadingEnvironmentDeployments = 'loading'
      })
      .addCase(fetchEnvironmentDeploymentHistory.fulfilled, (state: EnvironmentsState, action) => {
        const update = {
          id: action.meta.arg.environmentId,
          changes: {
            deployments: action.payload,
          },
        }
        environmentsAdapter.updateOne(state, update as Update<Environment>)
        state.loadingEnvironmentDeployments = 'loaded'
      })
      .addCase(fetchEnvironmentDeploymentHistory.rejected, (state: EnvironmentsState, action) => {
        state.loadingEnvironmentDeployments = 'error'
        state.error = action.error.message
      })
  },
})

export const environments = environmentsSlice.reducer

export const environmentsActions = environmentsSlice.actions

const { selectAll, selectEntities } = environmentsAdapter.getSelectors()

export const getEnvironmentsState = (rootState: RootState): EnvironmentsState =>
  rootState.entities[ENVIRONMENTS_FEATURE_KEY]

export const selectAllEnvironments = createSelector(getEnvironmentsState, selectAll)

export const selectEnvironmentsEntities = createSelector(getEnvironmentsState, selectEntities)

export const selectEnvironmentsEntitiesByProjectId = (state: RootState, projectId: string): EnvironmentEntity[] => {
  const environmentState = getEnvironmentsState(state)
  return getEntitiesByIds<Environment>(environmentState.entities, environmentState?.joinProjectEnvironments[projectId])
}

export const selectEnvironmentsEntitiesByClusterId = (clusterId: string) =>
  createSelector(
    (state: RootState) => {
      return selectAll(getEnvironmentsState(state))
    },
    (environments): EnvironmentEntity[] => {
      return environments.filter((env) => {
        return env.cluster_id === clusterId
      })
    }
  )

export const selectEnvironmentsIdByClusterId = createSelector(
  [getEnvironmentsState, (state, clusterId: string) => clusterId],
  (state, clusterId) => {
    const environments = selectAll(state)
    return environments
      .filter((env) => {
        return env.cluster_id === clusterId
      })
      .map((env) => env.id)
  }
)

export const selectEnvironmentById = (state: RootState, environmentId: string) =>
  getEnvironmentsState(state).entities[environmentId]

export const environmentsLoadingStatus = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingStatus

export const environmentsLoadingEnvironmentStatus = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingEnvironmentStatus

export const environmentsLoadingEnvironmentDeployments = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingEnvironmentDeployments
