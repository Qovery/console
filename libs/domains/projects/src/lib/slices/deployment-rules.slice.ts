import { Update, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { ProjectDeploymentRule, ProjectDeploymentRuleApi, ProjectDeploymentRuleRequest } from 'qovery-typescript-axios'
import { DeploymentRuleState, LoadingStatus } from '@qovery/shared/interfaces'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const DEPLOYMENT_RULES_FEATURE_KEY = 'deploymentRules'

const deploymentRulesApi = new ProjectDeploymentRuleApi()

export const deploymentRulesAdapter = createEntityAdapter<ProjectDeploymentRule>()

export const fetchDeploymentRules = createAsyncThunk<ProjectDeploymentRule[], { projectId: string }>(
  'project/deploymentRules/fetch',
  async (data) => {
    const response = await deploymentRulesApi.listProjectDeploymentRules(data.projectId)
    return response.data.results as ProjectDeploymentRule[]
  }
)

export const fetchDeploymentRule = createAsyncThunk(
  'project/deploymentRule/fetch',
  async (payload: { projectId: string; deploymentRuleId: string }) => {
    const response = await deploymentRulesApi.getProjectDeploymentRule(payload.projectId, payload.deploymentRuleId)
    return response.data as ProjectDeploymentRule
  }
)

export const postDeploymentRule = createAsyncThunk(
  'project/deploymentRules/post',
  async (payload: { projectId: string; data: ProjectDeploymentRuleRequest }) => {
    const result = await deploymentRulesApi.createDeploymentRule(payload.projectId, payload.data)
    return result.data
  }
)

export const updateDeploymentRuleOrder = createAsyncThunk(
  'project/deploymentRules/update-order',
  async (payload: { projectId: string; deploymentRules: ProjectDeploymentRule[] }) => {
    const ids: string[] = payload.deploymentRules.map((rule) => rule.id)
    await deploymentRulesApi.updateDeploymentRulesPriorityOrder(payload.projectId, {
      project_deployment_rule_ids_in_order: ids,
    })
    return payload.deploymentRules
  }
)

export const deleteDeploymentRule = createAsyncThunk(
  'project/deploymentRules/delete',
  async (payload: { projectId: string; deploymentRuleId: string }) => {
    const response = await deploymentRulesApi.deleteProjectDeploymentRule(payload.projectId, payload.deploymentRuleId)
    return response.data
  }
)

export const updateDeploymentRule = createAsyncThunk(
  'project/deploymentRules/update',
  async (payload: { projectId: string; deploymentRuleId: string; data: ProjectDeploymentRuleRequest }) => {
    const response = await deploymentRulesApi.editProjectDeployemtnRule(
      payload.projectId,
      payload.deploymentRuleId,
      payload.data
    )
    return response.data
  }
)

export const initialDeploymentRulesState: DeploymentRuleState = deploymentRulesAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinProjectDeploymentRules: {},
})

export const deploymentRulesSlice = createSlice({
  name: DEPLOYMENT_RULES_FEATURE_KEY,
  initialState: initialDeploymentRulesState,
  reducers: {
    addDeploymentRule: deploymentRulesAdapter.addOne,
    removeDeploymentRule: deploymentRulesAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      // fetch all deployment rules
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
      // fetch one deployment rule
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
      // post one deployment rule
      .addCase(postDeploymentRule.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postDeploymentRule.fulfilled, (state: DeploymentRuleState, action) => {
        deploymentRulesAdapter.upsertOne(state, action.payload)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Your rule is created')
      })
      .addCase(postDeploymentRule.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        // @todo fix with toastError
        toast(ToastEnum.ERROR, action.error.message || `Your rule isn't created`)
        state.error = action.error.message
      })
      // update order for one deployment rule
      .addCase(updateDeploymentRuleOrder.fulfilled, (state: DeploymentRuleState, action) => {
        state.joinProjectDeploymentRules = {}
        deploymentRulesAdapter.upsertMany(state, action.payload)
        action.payload.forEach((deploymentRule: ProjectDeploymentRule) => {
          state.joinProjectDeploymentRules = addOneToManyRelation(action.meta.arg.projectId, deploymentRule.id, {
            ...state.joinProjectDeploymentRules,
          })
        })

        state.loadingStatus = 'loaded'
      })
      .addCase(updateDeploymentRuleOrder.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // delete deployment rule
      .addCase(deleteDeploymentRule.pending, (state: DeploymentRuleState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(deleteDeploymentRule.fulfilled, (state: DeploymentRuleState, action) => {
        deploymentRulesAdapter.removeOne(state, action.meta.arg.deploymentRuleId)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Your rule is deleted')
      })
      .addCase(deleteDeploymentRule.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        // @todo fix with toastError
        toast(ToastEnum.ERROR, action.error.message || `Your rule isn't deleted`)
        state.error = action.error.message
      })
      // update deployment rule
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
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Your rule is updated')
      })
      .addCase(updateDeploymentRule.rejected, (state: DeploymentRuleState, action) => {
        state.loadingStatus = 'error'
        // @todo fix with toastError
        toast(ToastEnum.ERROR, action.error.message || `Your rule isn't updated`)
        state.error = action.error.message
      })
  },
})

export const deploymentRulesReducer = deploymentRulesSlice.reducer

export const { addDeploymentRule, removeDeploymentRule } = deploymentRulesSlice.actions

const { selectAll, selectEntities } = deploymentRulesAdapter.getSelectors()

export const getDeploymentRulesState = (rootState: RootState): DeploymentRuleState =>
  rootState.project[DEPLOYMENT_RULES_FEATURE_KEY]

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
