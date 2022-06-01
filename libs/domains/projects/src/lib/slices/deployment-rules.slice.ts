import { DeploymentRuleState, LoadingStatus } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, Update } from '@reduxjs/toolkit'
import {
  ProjectDeploymentRule,
  ProjectDeploymentRuleApi,
  ProjectDeploymentRuleRequest,
  ProjectDeploymentRulesPriorityOrderRequest,
} from 'qovery-typescript-axios'
import { RootState } from '@console/store/data'
import { deploymentRulesFactoryMock } from '../mocks/factories/deployment-rules-factory.mock'

export const DEPLOYMENTRULES_FEATURE_KEY = 'deploymentRules'

const deploymentRulesApi = new ProjectDeploymentRuleApi()

export const deploymentRulesAdapter = createEntityAdapter<ProjectDeploymentRule>()

export const fetchDeploymentRules = createAsyncThunk<ProjectDeploymentRule[], { projectId: string }>(
  'project/deploymentRules/fetch',
  async (data) => {
    const response = await deploymentRulesApi
      .listProjectDeploymentRules(data.projectId)
      .then((response) => response.data)
    return response.results as ProjectDeploymentRule[]
  }
)

export const fetchDeploymentRule = createAsyncThunk<
  ProjectDeploymentRule,
  { projectId: string; deploymentRuleId: string }
>('project/deploymentRule/fetch', async (data) => {
  const response = await deploymentRulesApi
    .getProjectDeploymentRule(data.projectId, data.deploymentRuleId)
    .then((response) => response.data)
  return response as ProjectDeploymentRule
})

export const postDeploymentRules = createAsyncThunk<
  ProjectDeploymentRule,
  { projectId: string } & ProjectDeploymentRuleRequest
>('project/deploymentRules/post', async (data, { rejectWithValue }) => {
  const { projectId, ...fields } = data

  try {
    const result = await deploymentRulesApi
      .createDeploymentRule(projectId, { ...fields })
      .then((response) => response.data)
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const updateDeploymentRuleOrder = createAsyncThunk<
  any,
  { projectId: string; deploymentRules: ProjectDeploymentRule[] }
>('project/deploymentRules/update-order', async (data) => {
  const ids: string[] = data.deploymentRules.map((rule) => rule.id)
  const response = await deploymentRulesApi
    .updateDeploymentRulesPriorityOrder(data.projectId, {
      project_deployment_rule_ids_in_order: ids,
    })
    .then((res) => res.data)
  return data.deploymentRules
})

export const deleteDeploymentRule = createAsyncThunk<string, { projectId: string; deploymentRuleId: string }>(
  'project/deploymentRules/delete',
  async (data, { rejectWithValue }) => {
    const { projectId, deploymentRuleId } = data

    try {
      await deploymentRulesApi
        .deleteProjectDeploymentRule(projectId, deploymentRuleId)
        .then((response) => response.data)
      return deploymentRuleId
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const updateDeploymentRule = createAsyncThunk<
  ProjectDeploymentRule,
  { projectId: string; deploymentRuleId: string } & ProjectDeploymentRuleRequest
>('project/deploymentRules/update', async (data, { rejectWithValue }) => {
  const { projectId, deploymentRuleId, ...fields } = data

  try {
    const result = await deploymentRulesApi
      .editProjectDeployemtnRule(projectId, deploymentRuleId, { ...(fields as ProjectDeploymentRuleRequest) })
      .then((response) => response.data)
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const initialDeploymentRulesState: DeploymentRuleState = deploymentRulesAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinProjectDeploymentRules: {},
})

export const deploymentRulesSlice = createSlice({
  name: DEPLOYMENTRULES_FEATURE_KEY,
  initialState: initialDeploymentRulesState,
  reducers: {
    addDeploymentRule: deploymentRulesAdapter.addOne,
    removeDeploymentRule: deploymentRulesAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeploymentRules.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchDeploymentRules.fulfilled, (state: DeploymentRuleState, action) => {
        deploymentRulesAdapter.upsertMany(state, action.payload)
        action.payload.forEach((deploymentRule) => {
          state.joinProjectDeploymentRules = addOneToManyRelation(action.meta.arg.projectId, deploymentRule.id, {
            ...state.joinProjectDeploymentRules,
          })
        })

        state.loadingStatus = 'loaded'
      })
      .addCase(fetchDeploymentRules.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // fetch one
      .addCase(fetchDeploymentRule.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchDeploymentRule.fulfilled, (state: DeploymentRuleState, action) => {
        deploymentRulesAdapter.upsertOne(state, action.payload)

        state.joinProjectDeploymentRules = addOneToManyRelation(
          action.meta.arg.projectId,
          action.meta.arg.deploymentRuleId,
          {
            ...state.joinProjectDeploymentRules,
          }
        )

        state.loadingStatus = 'loaded'
      })
      .addCase(fetchDeploymentRule.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // post
      .addCase(postDeploymentRules.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postDeploymentRules.fulfilled, (state: DeploymentRuleState, action) => {
        deploymentRulesAdapter.upsertOne(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(postDeploymentRules.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // update order
      .addCase(updateDeploymentRuleOrder.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(updateDeploymentRuleOrder.fulfilled, (state: DeploymentRuleState, action) => {
        state.joinProjectDeploymentRules = {}
        deploymentRulesAdapter.upsertMany(state, action.payload)
        action.payload.forEach((deploymentRule: ProjectDeploymentRule) => {
          state.joinProjectDeploymentRules = addOneToManyRelation(action.meta.arg.projectId, deploymentRule.id, {
            ...state.joinProjectDeploymentRules,
          })
        })

        console.log(state.entities)

        state.loadingStatus = 'loaded'
      })
      .addCase(updateDeploymentRuleOrder.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // delete
      .addCase(deleteDeploymentRule.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(deleteDeploymentRule.fulfilled, (state: DeploymentRuleState, action) => {
        deploymentRulesAdapter.removeOne(state, action.meta.arg.deploymentRuleId)
        state.loadingStatus = 'loaded'
      })
      .addCase(deleteDeploymentRule.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // update
      .addCase(updateDeploymentRule.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(updateDeploymentRule.fulfilled, (state: DeploymentRuleState, action) => {
        const update: Update<ProjectDeploymentRule> = {
          id: action.payload.id,
          changes: {
            ...action.payload,
          },
        }
        deploymentRulesAdapter.updateOne(state, update)
        state.loadingStatus = 'loaded'
      })
      .addCase(updateDeploymentRule.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const deploymentRulesReducer = deploymentRulesSlice.reducer

export const { addDeploymentRule, removeDeploymentRule } = deploymentRulesSlice.actions

const { selectAll, selectEntities } = deploymentRulesAdapter.getSelectors()

export const getDeploymentRulesState = (rootState: RootState): DeploymentRuleState =>
  rootState.entities.project[DEPLOYMENTRULES_FEATURE_KEY]

export const deploymentRulesLoadingStatus = (state: RootState): LoadingStatus =>
  getDeploymentRulesState(state).loadingStatus

export const selectAllDeploymentRules = createSelector(getDeploymentRulesState, selectAll)

export const selectDeploymentRulesEntitiesByProjectId = (
  state: RootState,
  projectId: string
): ProjectDeploymentRule[] => {
  const deploymentRuleState = getDeploymentRulesState(state)
  return getEntitiesByIds<ProjectDeploymentRule>(
    deploymentRuleState.entities,
    deploymentRuleState?.joinProjectDeploymentRules[projectId]
  )
}

export const selectDeploymentRuleById = (state: RootState, deploymentRuleId: string) =>
  getDeploymentRulesState(state).entities[deploymentRuleId]

export const selectDeploymentRulesEntities = createSelector(getDeploymentRulesState, selectEntities)
