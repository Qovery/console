import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import {
  ApplicationSecretApi,
  EnvironmentSecretApi,
  EnvironmentVariableRequest,
  EnvironmentVariableScopeEnum,
  ProjectSecretApi,
  Value,
} from 'qovery-typescript-axios'
import { RootState } from '@console/store/data'
import { SecretEnvironmentVariableEntity, SecretEnvironmentVariablesState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'
import { Key } from 'qovery-typescript-axios/api'
import { errorToaster, toast, ToastEnum } from '@console/shared/toast'

export const SECRET_ENVIRONMENT_VARIABLES_FEATURE_KEY = 'secret'

export const secretEnvironmentVariablesAdapter = createEntityAdapter<SecretEnvironmentVariableEntity>()

const applicationSecretApi = new ApplicationSecretApi()
const environmentSecretApi = new EnvironmentSecretApi()
const projectSecretApi = new ProjectSecretApi()

export const fetchSecretEnvironmentVariables = createAsyncThunk(
  'secretEnvironmentVariables/list',
  async (applicationId: string, thunkAPI) => {
    const response = await applicationSecretApi.listApplicationSecrets(applicationId)

    return response.data.results as SecretEnvironmentVariableEntity[]
  }
)

export const createSecret = createAsyncThunk(
  'secretEnvironmentVariables/create',
  async (payload: {
    entityId: string
    applicationId: string
    environmentVariableRequest: EnvironmentVariableRequest
    scope: EnvironmentVariableScopeEnum
  }) => {
    let response
    switch (payload.scope) {
      case EnvironmentVariableScopeEnum.ENVIRONMENT:
        response = await environmentSecretApi.createEnvironmentSecret(
          payload.entityId,
          payload.environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.PROJECT:
        response = await projectSecretApi.createProjectSecret(payload.entityId, payload.environmentVariableRequest)

        break
      case EnvironmentVariableScopeEnum.APPLICATION:
      default:
        response = await applicationSecretApi.createApplicationSecret(
          payload.entityId,
          payload.environmentVariableRequest
        )
        break
    }
    return response.data
  }
)

export const createOverrideSecret = createAsyncThunk(
  'secretEnvironmentVariables/create-override',
  async (payload: {
    entityId: string
    applicationId: string
    environmentVariableId: string
    environmentVariableRequest: Value
    scope: EnvironmentVariableScopeEnum
  }) => {
    const { entityId, environmentVariableId, environmentVariableRequest } = payload
    let response
    switch (payload.scope) {
      case EnvironmentVariableScopeEnum.ENVIRONMENT:
        response = await environmentSecretApi.createEnvironmentSecretOverride(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.PROJECT:
        response = await projectSecretApi.createProjectSecretOverride(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.APPLICATION:
      default:
        response = await applicationSecretApi.createApplicationSecretOverride(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
    }

    return response.data
  }
)

export const createAliasSecret = createAsyncThunk(
  'secretEnvironmentVariables/create-alias',
  async (payload: {
    entityId: string
    applicationId: string
    environmentVariableId: string
    environmentVariableRequest: Key
    scope: EnvironmentVariableScopeEnum
  }) => {
    const { entityId, environmentVariableId, environmentVariableRequest } = payload
    let response
    switch (payload.scope) {
      case EnvironmentVariableScopeEnum.ENVIRONMENT:
        response = await environmentSecretApi.createEnvironmentSecretAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.PROJECT:
        response = await projectSecretApi.createProjectSecretAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.APPLICATION:
      default:
        response = await applicationSecretApi.createApplicationSecretAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
    }

    return response.data
  }
)

export const editSecret = createAsyncThunk(
  'secretEnvironmentVariables/edit',
  async (payload: {
    entityId: string
    environmentVariableId: string
    environmentVariableRequest: EnvironmentVariableRequest
    scope: EnvironmentVariableScopeEnum
  }) => {
    let response
    switch (payload.scope) {
      case EnvironmentVariableScopeEnum.ENVIRONMENT:
        response = await environmentSecretApi.editEnvironmentSecret(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.PROJECT:
        response = await projectSecretApi.editProjectSecret(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )

        break
      case EnvironmentVariableScopeEnum.APPLICATION:
      default:
        response = await applicationSecretApi.editApplicationSecret(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )
        break
    }
    return response.data
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
      .addCase(createSecret.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        addSecretToStore(state, action)
        state.error = null
        toast(ToastEnum.SUCCESS, 'Creation success', 'Your environment variable has been created successfully')
      })
      .addCase(createSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        state.error = action.error.message
        errorToaster(action.error)
      })
      .addCase(createAliasSecret.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        addSecretToStore(state, action)
        state.error = null
        toast(ToastEnum.SUCCESS, 'Creation success', 'Your environment variable override has been created successfully')
      })
      .addCase(createAliasSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        errorToaster(action.error)
        state.error = action.error.message
      })
      .addCase(createOverrideSecret.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        addSecretToStore(state, action)
        state.error = null
        toast(ToastEnum.SUCCESS, 'Creation success', 'Your environment variable alias has been created successfully')
      })
      .addCase(createOverrideSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        errorToaster(action.error)
        state.error = null
        state.error = action.error.message
      })
      .addCase(editSecret.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        const extendedEnv: SecretEnvironmentVariableEntity = {
          ...action.payload,
          variable_type: 'secret',
        }
        secretEnvironmentVariablesAdapter.updateOne(state, {
          id: extendedEnv.id,
          changes: extendedEnv,
        })
        state.error = null
        toast(ToastEnum.SUCCESS, 'Edition success', 'Variable edited successfully')
      })
      .addCase(editSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        state.error = action.error.message
        errorToaster(action.error)
      })
  },
})

const addSecretToStore = (state: SecretEnvironmentVariablesState, action: any) => {
  if (!action.payload) return

  const extendedEnv: SecretEnvironmentVariableEntity = {
    ...action.payload,
    variable_type: 'secret',
    service_name: action.payload.service_name || '',
  }
  secretEnvironmentVariablesAdapter.addOne(state, extendedEnv)

  state.joinApplicationSecretEnvironmentVariable = addOneToManyRelation(action.meta.arg.applicationId, extendedEnv.id, {
    ...state.joinApplicationSecretEnvironmentVariable,
  })
  state.loadingStatus = 'loaded'
}

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
    return variables
  }
)
