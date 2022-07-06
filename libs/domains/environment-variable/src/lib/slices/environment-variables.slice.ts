import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { ApplicationEnvironmentVariableApi } from 'qovery-typescript-axios'

import { RootState } from '@console/store/data'
import { EnvironmentVariableEntity, EnvironmentVariablesState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'

export const ENVIRONMENT_VARIABLES_FEATURE_KEY = 'environmentVariables'
export const environmentVariablesAdapter = createEntityAdapter<EnvironmentVariableEntity>()

const applicationEnvironmentVariableApi = new ApplicationEnvironmentVariableApi()

export const fetchEnvironmentVariables = createAsyncThunk(
  'environmentVariables/list',
  async (applicationId: string) => {
    const response = await applicationEnvironmentVariableApi.listApplicationEnvironmentVariable(applicationId)

    return response.data.results as EnvironmentVariableEntity[]
  }
)

export const initialEnvironmentVariablesState: EnvironmentVariablesState = environmentVariablesAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinApplicationEnvironmentVariable: {},
})

export const environmentVariablesSlice = createSlice({
  name: ENVIRONMENT_VARIABLES_FEATURE_KEY,
  initialState: initialEnvironmentVariablesState,
  reducers: {
    add: environmentVariablesAdapter.addOne,
    remove: environmentVariablesAdapter.removeOne,
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnvironmentVariables.pending, (state: EnvironmentVariablesState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        const extendedEnvs: EnvironmentVariableEntity[] = action.payload.map((env) => {
          return {
            ...env,
            variable_type: 'public',
          }
        })
        environmentVariablesAdapter.setAll(state, extendedEnvs)
        action.payload.forEach((secret) => {
          state.joinApplicationEnvironmentVariable = addOneToManyRelation(action.meta.arg, secret.id, {
            ...state.joinApplicationEnvironmentVariable,
          })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const environmentVariables = environmentVariablesSlice.reducer

export const environmentVariablesActions = environmentVariablesSlice.actions

const { selectAll, selectEntities } = environmentVariablesAdapter.getSelectors()

export const getEnvironmentVariablesState = (rootState: RootState): EnvironmentVariablesState =>
  rootState['entities'][ENVIRONMENT_VARIABLES_FEATURE_KEY]

export const selectAllEnvironmentVariables = createSelector(getEnvironmentVariablesState, selectAll)

export const selectEnvironmentVariablesEntities = createSelector(getEnvironmentVariablesState, selectEntities)

export const selectEnvironmentVariablesByApplicationId = createSelector(
  [getEnvironmentVariablesState, (state, applicationId: string) => applicationId],
  (state, applicationId) => {
    const variables = getEntitiesByIds<EnvironmentVariableEntity>(
      state.entities,
      state.joinApplicationEnvironmentVariable[applicationId]
    )

    const sortedAscii = variables
      .filter((sorted) => !sorted.aliased_variable && !sorted.overridden_variable)
      .sort((a, b) => {
        if (a.key < b.key) {
          return -1
        }
        if (a.key > b.key) {
          return 1
        }
        return 0
      })

    const withAliasOrOverride = variables.filter((sorted) => sorted.aliased_variable || sorted.overridden_variable)

    const final: EnvironmentVariableEntity[] = []

    sortedAscii.map((el) => {
      final.push(el)
      withAliasOrOverride.some((elAliasOrOverride) => {
        if (
          elAliasOrOverride.aliased_variable?.key === el.key ||
          elAliasOrOverride.overridden_variable?.key === el.key
        ) {
          final.push(elAliasOrOverride)
        }
      })
    })

    return final
  }
)
