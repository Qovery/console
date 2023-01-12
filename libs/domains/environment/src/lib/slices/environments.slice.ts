import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
  CloneRequest,
  ContainersApi,
  CreateEnvironmentRequest,
  DatabasesApi,
  DeploymentHistoryEnvironment,
  Environment,
  EnvironmentActionsApi,
  EnvironmentDeploymentHistoryApi,
  EnvironmentDeploymentRule,
  EnvironmentDeploymentRuleApi,
  EnvironmentEditRequest,
  EnvironmentMainCallsApi,
  EnvironmentsApi,
  Status,
} from 'qovery-typescript-axios'
import { EnvironmentEntity, EnvironmentsState, WebsocketRunningStatusInterface } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds, refactoPayload, shortToLongId } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environmentsApi = new EnvironmentsApi()
const environmentsActionsApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const environmentDeploymentsApi = new EnvironmentDeploymentHistoryApi()
const environmentDeploymentRulesApi = new EnvironmentDeploymentRuleApi()
const environmentContainersApi = new ContainersApi()
const databasesApi = new DatabasesApi()

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
  { environmentId: string; silently?: boolean }
>('environments-deployments/fetch', async (data) => {
  const response = await environmentDeploymentsApi.listEnvironmentDeploymentHistory(data.environmentId)
  return response.data.results as DeploymentHistoryEnvironment[]
})

export const updateEnvironment = createAsyncThunk(
  'environment/update',
  async (payload: { environmentId: string; data: EnvironmentEditRequest }) => {
    const response = await environmentMainCallsApi.editEnvironment(payload.environmentId, payload.data)
    return response.data
  }
)

export const fetchEnvironmentDeploymentRules = createAsyncThunk(
  'environment-deployment-rules/fetch',
  async (environmentId: string) => {
    const response = await environmentDeploymentRulesApi.getEnvironmentDeploymentRule(environmentId)
    return response.data as EnvironmentDeploymentRule
  }
)

export const editEnvironmentDeploymentRules = createAsyncThunk(
  'environment-deployment-rules/edit',
  async (payload: { environmentId: string; deploymentRuleId: string; data: EnvironmentDeploymentRule }) => {
    const cloneEnvironmentDeploymentRules = Object.assign({}, refactoPayload(payload.data) as any)

    const response = await environmentDeploymentRulesApi.editEnvironmentDeploymentRule(
      payload.environmentId,
      payload.deploymentRuleId,
      cloneEnvironmentDeploymentRules
    )
    return response.data as EnvironmentDeploymentRule
  }
)

export const createEnvironment = createAsyncThunk(
  'environment/create',
  async (payload: { projectId: string; environmentRequest: CreateEnvironmentRequest }) => {
    const response = await environmentsApi.createEnvironment(payload.projectId, payload.environmentRequest)
    return response.data
  }
)

export const cloneEnvironment = createAsyncThunk(
  'environment/clone',
  async (payload: { environmentId: string; cloneRequest: CloneRequest }) => {
    const response = await environmentsActionsApi.cloneEnvironment(payload.environmentId, payload.cloneRequest)
    return response.data
  }
)

export const fetchEnvironmentContainers = createAsyncThunk(
  'environment-containers/fetch',
  async (payload: { environmentId: string }) => {
    const response = await environmentContainersApi.listContainer(payload.environmentId)
    return response.data
  }
)

export const fetchDatabaseConfiguration = createAsyncThunk(
  'environment/database-configuration/fetch',
  async (payload: { environmentId: string }) => {
    const response = await databasesApi.listEnvironmentDatabaseConfig(payload.environmentId)
    return response.data.results
  }
)

export const initialEnvironmentsState: EnvironmentsState = environmentsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  loadingEnvironmentStatus: 'not loaded',
  loadingEnvironmentDeployments: 'not loaded',
  loadingEnvironmentDeploymentRules: 'not loaded',
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
        environmentsAdapter.setAll(state, action.payload)
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
      // create environment
      .addCase(createEnvironment.fulfilled, (state: EnvironmentsState, action: PayloadAction<Environment>) => {
        environmentsAdapter.addOne(state, action.payload)
        state.joinProjectEnvironments = addOneToManyRelation(action.payload.project?.id, action.payload.id, {
          ...state.joinProjectEnvironments,
        })
        toast(ToastEnum.SUCCESS, 'Your environment has been successfully created')
      })
      .addCase(createEnvironment.rejected, (state: EnvironmentsState, action) => {
        state.error = action.error.message
        toast(ToastEnum.ERROR, 'Creation Error', state.error)
      })
      // clone environment
      .addCase(cloneEnvironment.fulfilled, (state: EnvironmentsState, action: PayloadAction<Environment>) => {
        environmentsAdapter.addOne(state, action.payload)
        state.joinProjectEnvironments = addOneToManyRelation(action.payload.project?.id, action.payload.id, {
          ...state.joinProjectEnvironments,
        })
        toast(ToastEnum.SUCCESS, 'Your environment has been successfully cloned')
      })
      .addCase(cloneEnvironment.rejected, (state: EnvironmentsState, action) => {
        state.error = action.error.message
        toast(ToastEnum.ERROR, 'Cloning Error', state.error)
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
      .addCase(fetchEnvironmentDeploymentHistory.pending, (state: EnvironmentsState, action) => {
        if (!action.meta.arg.silently) state.loadingEnvironmentDeployments = 'loading'
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
      // update environment
      .addCase(updateEnvironment.pending, (state: EnvironmentsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(updateEnvironment.fulfilled, (state: EnvironmentsState, action) => {
        const update: Update<Environment> = {
          id: action.payload.id,
          changes: {
            ...action.payload,
          },
        }
        environmentsAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Your environment is updated')
      })
      .addCase(updateEnvironment.rejected, (state: EnvironmentsState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // fetch environment deployment rules
      .addCase(fetchEnvironmentDeploymentRules.pending, (state: EnvironmentsState) => {
        state.loadingEnvironmentDeploymentRules = 'loading'
      })
      .addCase(fetchEnvironmentDeploymentRules.fulfilled, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg,
          changes: {
            deploymentRules: action.payload,
          },
        }
        environmentsAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
        state.loadingEnvironmentDeploymentRules = 'loaded'
      })
      .addCase(fetchEnvironmentDeploymentRules.rejected, (state: EnvironmentsState, action) => {
        state.loadingEnvironmentDeploymentRules = 'error'
        state.error = action.error.message
      })
      // update environment deployment rules
      .addCase(editEnvironmentDeploymentRules.pending, (state: EnvironmentsState) => {
        state.loadingEnvironmentDeploymentRules = 'loading'
      })
      .addCase(editEnvironmentDeploymentRules.fulfilled, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg.environmentId,
          changes: {
            deploymentRules: action.payload,
          },
        }
        environmentsAdapter.updateOne(state, update)
        state.error = null
        state.loadingEnvironmentDeploymentRules = 'loaded'
        toast(ToastEnum.SUCCESS, 'Your environment deployment rules is updated')
      })
      .addCase(editEnvironmentDeploymentRules.rejected, (state: EnvironmentsState, action) => {
        state.loadingEnvironmentDeploymentRules = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // fetch database configurations for this environment
      .addCase(fetchDatabaseConfiguration.pending, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg.environmentId,
          changes: {
            databaseConfigurations: {
              loadingStatus: 'loading',
            },
          },
        }
        environmentsAdapter.updateOne(state, update)
      })
      .addCase(fetchDatabaseConfiguration.fulfilled, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg.environmentId,
          changes: {
            databaseConfigurations: {
              loadingStatus: 'loaded',
              data: action.payload,
            },
          },
        }
        environmentsAdapter.updateOne(state, update)
      })
  },
})

export const environments = environmentsSlice.reducer

export const environmentsActions = environmentsSlice.actions

const { selectAll, selectEntities } = environmentsAdapter.getSelectors()

export const getEnvironmentsState = (rootState: RootState): EnvironmentsState =>
  rootState.environment[ENVIRONMENTS_FEATURE_KEY]

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

export const environmentsLoadingEnvironmentDeploymentRules = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingEnvironmentDeploymentRules

export const selectEnvironmentDeploymentRulesByEnvId = (
  state: RootState,
  environmentId: string
): EnvironmentDeploymentRule | undefined => {
  return getEnvironmentsState(state).entities[environmentId]?.deploymentRules
}
