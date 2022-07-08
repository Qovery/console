import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { ApplicationSecretApi } from 'qovery-typescript-axios'
import { RootState } from '@console/store/data'
import { SecretEnvironmentVariableEntity, SecretEnvironmentVariablesState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'

export const SECRET_ENVIRONMENT_VARIABLES_FEATURE_KEY = 'secret'

export const secretEnvironmentVariablesAdapter = createEntityAdapter<SecretEnvironmentVariableEntity>()

const applicationSecretApi = new ApplicationSecretApi()

export const fetchSecretEnvironmentVariables = createAsyncThunk(
  'secretEnvironmentVariables/list',
  async (applicationId: string, thunkAPI) => {
    const response = await applicationSecretApi.listApplicationSecrets(applicationId)

    return response.data.results as SecretEnvironmentVariableEntity[]
  }
)

export const initialSecretEnvironmentVariablesState: SecretEnvironmentVariablesState =
  secretEnvironmentVariablesAdapter.getInitialState({
    loadingStatus: 'not loaded',
    error: null,
    joinApplicationSecretEnvironmentVariable: {},
  })

export const secretEnvironmentVariablesSlice = createSlice({
  name: SECRET_ENVIRONMENT_VARIABLES_FEATURE_KEY,
  initialState: initialSecretEnvironmentVariablesState,
  reducers: {
    add: secretEnvironmentVariablesAdapter.addOne,
    remove: secretEnvironmentVariablesAdapter.removeOne,
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecretEnvironmentVariables.pending, (state: SecretEnvironmentVariablesState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchSecretEnvironmentVariables.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        const extendedEnvs: SecretEnvironmentVariableEntity[] = action.payload.map((env) => ({
          ...env,
          variable_type: 'secret',
        }))

        secretEnvironmentVariablesAdapter.setAll(state, extendedEnvs)
        action.payload.forEach((secret) => {
          state.joinApplicationSecretEnvironmentVariable = addOneToManyRelation(action.meta.arg, secret.id, {
            ...state.joinApplicationSecretEnvironmentVariable,
          })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchSecretEnvironmentVariables.rejected, (state: SecretEnvironmentVariablesState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const secretEnvironmentVariables = secretEnvironmentVariablesSlice.reducer

export const secretEnvironmentVariablesActions = secretEnvironmentVariablesSlice.actions

const { selectAll, selectEntities } = secretEnvironmentVariablesAdapter.getSelectors()

export const getSecretEnvironmentVariablesState = (rootState: RootState): SecretEnvironmentVariablesState =>
  rootState['entities']['environmentVariable'][SECRET_ENVIRONMENT_VARIABLES_FEATURE_KEY]

export const selectAllSecretEnvironmentVariables = createSelector(getSecretEnvironmentVariablesState, selectAll)

export const selectSecretEnvironmentVariablesEntities = createSelector(
  getSecretEnvironmentVariablesState,
  selectEntities
)

export const selectSecretEnvironmentVariablesByApplicationId = createSelector(
  [getSecretEnvironmentVariablesState, (state, applicationId: string) => applicationId],
  (state, applicationId) => {
    const variables = getEntitiesByIds<SecretEnvironmentVariableEntity>(
      state.entities,
      state.joinApplicationSecretEnvironmentVariable[applicationId]
    )

    const sortedAscii = variables
      .filter((sorted) => !sorted.aliased_secret && !sorted.overridden_secret)
      .sort((a, b) => {
        if (!a.key || !b.key) return 0

        if (a.key < b.key) {
          return -1
        }
        if (a.key > b.key) {
          return 1
        }
        return 0
      })

    const withAliasOrOverride = variables.filter((sorted) => sorted.aliased_secret || sorted.overridden_secret)

    const final: SecretEnvironmentVariableEntity[] = []

    sortedAscii.map((el) => {
      final.push(el)
      withAliasOrOverride.some((elAliasOrOverride) => {
        if (elAliasOrOverride.aliased_secret?.key === el.key || elAliasOrOverride.overridden_secret?.key === el.key) {
          final.push(elAliasOrOverride)
        }
      })
    })

    return final
  }
)
