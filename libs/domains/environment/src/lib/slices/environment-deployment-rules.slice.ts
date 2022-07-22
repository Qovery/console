import {
  EnvironmentDeploymentRule,
  EnvironmentDeploymentRuleApi,
  EnvironmentDeploymentRuleEditRequest,
} from 'qovery-typescript-axios'
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, Update } from '@reduxjs/toolkit'
import { RootState } from '@console/store/data'
import { EnvironmentDeploymentRulesState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'
import { errorToaster } from '@console/shared/toast'

export const ENVIRONMENT_DEPLOYMENT_RULES_FEATURE_KEY = 'environmentDeploymentRules'

export const environmentDeploymentRulesAdapter = createEntityAdapter<EnvironmentDeploymentRule>()

export const environmentDeploymentRulesApi = new EnvironmentDeploymentRuleApi()

export const fetchEnvironmentDeploymentRules = createAsyncThunk(
  'environmentDeploymentRules/fetch',
  async (environmentId: string) => {
    const response = await environmentDeploymentRulesApi.getEnvironmentDeploymentRule(environmentId)
    return response.data as EnvironmentDeploymentRule
  }
)

export const editEnvironmentDeploymentRules = createAsyncThunk(
  'environmentDeploymentRules/edit',
  async (payload: { environmentId: string; deploymentRuleId: string; data: EnvironmentDeploymentRuleEditRequest }) => {
    const response = await environmentDeploymentRulesApi.editEnvironmentDeploymentRule(
      payload.environmentId,
      payload.deploymentRuleId,
      payload.data
    )
    return response.data as EnvironmentDeploymentRule
  }
)

export const initialEnvironmentDeploymentRulesState: EnvironmentDeploymentRulesState =
  environmentDeploymentRulesAdapter.getInitialState({
    loadingStatus: 'not loaded',
    error: null,
    joinEnvironmentDeploymentRules: {},
  })

export const environmentDeploymentRulesSlice = createSlice({
  name: ENVIRONMENT_DEPLOYMENT_RULES_FEATURE_KEY,
  initialState: initialEnvironmentDeploymentRulesState,
  reducers: {
    add: environmentDeploymentRulesAdapter.addOne,
    remove: environmentDeploymentRulesAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      // fetch environment deployment rules
      .addCase(fetchEnvironmentDeploymentRules.pending, (state: EnvironmentDeploymentRulesState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchEnvironmentDeploymentRules.fulfilled, (state: EnvironmentDeploymentRulesState, action) => {
        environmentDeploymentRulesAdapter.upsertOne(state, action.payload)

        state.joinEnvironmentDeploymentRules = addOneToManyRelation(action.meta.arg, action.payload.id, {
          ...state.joinEnvironmentDeploymentRules,
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchEnvironmentDeploymentRules.rejected, (state: EnvironmentDeploymentRulesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // update environment deployment rules
      .addCase(editEnvironmentDeploymentRules.pending, (state: EnvironmentDeploymentRulesState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editEnvironmentDeploymentRules.fulfilled, (state: EnvironmentDeploymentRulesState, action) => {
        const update: Update<EnvironmentDeploymentRule> = {
          id: action.payload.id,
          changes: {
            ...action.payload,
          },
        }
        environmentDeploymentRulesAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
      })
      .addCase(editEnvironmentDeploymentRules.rejected, (state: EnvironmentDeploymentRulesState, action) => {
        state.loadingStatus = 'error'
        errorToaster(action.error)
        state.error = action.error.message
      })
  },
})

export const environmentDeploymentRulesReducer = environmentDeploymentRulesSlice.reducer

export const environmentDeploymentRulesActions = environmentDeploymentRulesSlice.actions

const { selectAll, selectEntities } = environmentDeploymentRulesAdapter.getSelectors()

export const getEnvironmentDeploymentRulesState = (rootState: RootState): EnvironmentDeploymentRulesState =>
  rootState.entities.environment[ENVIRONMENT_DEPLOYMENT_RULES_FEATURE_KEY]

export const selectEnvironmentDeploymentRulesEntitiesById = (
  state: RootState,
  environmentId: string
): EnvironmentDeploymentRule => {
  const deploymentRuleState = getEnvironmentDeploymentRulesState(state)
  return getEntitiesByIds<EnvironmentDeploymentRule>(
    deploymentRuleState.entities,
    deploymentRuleState?.joinEnvironmentDeploymentRules[environmentId]
  )[0]
}

export const selectAllEnvironmentDeploymentRules = createSelector(getEnvironmentDeploymentRulesState, selectAll)

export const selectEnvironmentDeploymentRulesEntities = createSelector(
  getEnvironmentDeploymentRulesState,
  selectEntities
)
