import { EnvironmentDeploymentRule, EnvironmentDeploymentRuleApi } from 'qovery-typescript-axios'
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@console/store/data'
import { EnvironmentDeploymentRulesState } from '@console/shared/interfaces'
import { getEntitiesByIds } from '@console/shared/utils'

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
      .addCase(fetchEnvironmentDeploymentRules.pending, (state: EnvironmentDeploymentRulesState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(
        fetchEnvironmentDeploymentRules.fulfilled,
        (state: EnvironmentDeploymentRulesState, action: PayloadAction<EnvironmentDeploymentRule>) => {
          console.log(action.payload)
          // environmentDeploymentRulesAdapter.setAll(state, action.payload)
          state.loadingStatus = 'loaded'
        }
      )
      .addCase(fetchEnvironmentDeploymentRules.rejected, (state: EnvironmentDeploymentRulesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const environmentDeploymentRulesReducer = environmentDeploymentRulesSlice.reducer

export const environmentDeploymentRulesActions = environmentDeploymentRulesSlice.actions

const { selectAll, selectEntities } = environmentDeploymentRulesAdapter.getSelectors()

export const getEnvironmentDeploymentRulesState = (rootState: RootState): EnvironmentDeploymentRulesState =>
  rootState.entities.environment[ENVIRONMENT_DEPLOYMENT_RULES_FEATURE_KEY]

export const selectAllEnvironmentDeploymentRules = createSelector(getEnvironmentDeploymentRulesState, selectAll)

// export const selectEnvironmentDeploymentRulesByEnvId = (state: RootState, environmentId: string): EnvironmentDeploymentRule[] => {
//   const appState = getEnvironmentDeploymentRulesState(state)
//   return getEntitiesByIds<Application>(appState.entities, appState?.joinEnvApplication[environmentId])
// }

export const selectEnvironmentDeploymentRulesEntities = createSelector(
  getEnvironmentDeploymentRulesState,
  selectEntities
)
