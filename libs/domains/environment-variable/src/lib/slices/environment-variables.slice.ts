import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import {
  ApplicationEnvironmentVariableApi,
  EnvironmentVariableApi,
  EnvironmentVariableRequest,
  EnvironmentVariableScopeEnum,
  ProjectEnvironmentVariableApi,
  Value,
} from 'qovery-typescript-axios'

import { RootState } from '@console/store/data'
import { EnvironmentVariableEntity, EnvironmentVariablesState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from '@console/shared/utils'
import { toast, ToastEnum, toastError } from '@console/shared/toast'
import { Key } from 'qovery-typescript-axios/api'

export const ENVIRONMENT_VARIABLES_FEATURE_KEY = 'public'
export const environmentVariablesAdapter = createEntityAdapter<EnvironmentVariableEntity>()

const applicationEnvironmentVariableApi = new ApplicationEnvironmentVariableApi()
const environmentEnvironmentVariableApi = new EnvironmentVariableApi()
const projectEnvironmentVariableApi = new ProjectEnvironmentVariableApi()

export const fetchEnvironmentVariables = createAsyncThunk(
  'environmentVariables/list',
  async (applicationId: string) => {
    const response = await applicationEnvironmentVariableApi.listApplicationEnvironmentVariable(applicationId)

    return response.data.results as EnvironmentVariableEntity[]
  }
)

export const createEnvironmentVariablePayloadCreator = async (payload: {
  entityId: string
  applicationId: string
  environmentVariableRequest: EnvironmentVariableRequest
  scope: EnvironmentVariableScopeEnum
  toasterCallback?: () => void
}) => {
  let response
  switch (payload.scope) {
    case EnvironmentVariableScopeEnum.ENVIRONMENT:
      response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariable(
        payload.entityId,
        payload.environmentVariableRequest
      )
      break
    case EnvironmentVariableScopeEnum.PROJECT:
      response = await projectEnvironmentVariableApi.createProjectEnvironmentVariable(
        payload.entityId,
        payload.environmentVariableRequest
      )

      break
    case EnvironmentVariableScopeEnum.APPLICATION:
    default:
      response = await applicationEnvironmentVariableApi.createApplicationEnvironmentVariable(
        payload.entityId,
        payload.environmentVariableRequest
      )
      break
  }
  return response.data
}

export const createEnvironmentVariables = createAsyncThunk(
  'environmentVariables/create',
  createEnvironmentVariablePayloadCreator
)

export const createOverrideEnvironmentVariablesPayloadCreator = async (payload: {
  entityId: string
  applicationId: string
  environmentVariableId: string
  environmentVariableRequest: Value
  scope: EnvironmentVariableScopeEnum
  toasterCallback?: () => void
}) => {
  const { entityId, environmentVariableId, environmentVariableRequest } = payload
  let response
  switch (payload.scope) {
    case EnvironmentVariableScopeEnum.ENVIRONMENT:
      response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariableOverride(
        entityId,
        environmentVariableId,
        environmentVariableRequest
      )
      break
    case EnvironmentVariableScopeEnum.PROJECT:
      response = await projectEnvironmentVariableApi.createProjectEnvironmentVariableOverride(
        entityId,
        environmentVariableId,
        environmentVariableRequest
      )
      break
    case EnvironmentVariableScopeEnum.APPLICATION:
    default:
      response = await applicationEnvironmentVariableApi.createApplicationEnvironmentVariableOverride(
        entityId,
        environmentVariableId,
        environmentVariableRequest
      )
      break
  }

  return response.data
}

export const createOverrideEnvironmentVariables = createAsyncThunk(
  'environmentVariables/create-override',
  createOverrideEnvironmentVariablesPayloadCreator
)

export const createAliasEnvironmentVariables = createAsyncThunk(
  'environmentVariables/create-alias',
  async (payload: {
    entityId: string
    applicationId: string
    environmentVariableId: string
    environmentVariableRequest: Key
    scope: EnvironmentVariableScopeEnum
    toasterCallback?: () => void
  }) => {
    const { entityId, environmentVariableId, environmentVariableRequest } = payload
    let response
    switch (payload.scope) {
      case EnvironmentVariableScopeEnum.ENVIRONMENT:
        response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariableAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.PROJECT:
        response = await projectEnvironmentVariableApi.createProjectEnvironmentVariableAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.APPLICATION:
      default:
        response = await applicationEnvironmentVariableApi.createApplicationEnvironmentVariableAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
    }

    return response.data
  }
)

export const editEnvironmentVariables = createAsyncThunk(
  'environmentVariables/edit',
  async (payload: {
    entityId: string
    environmentVariableId: string
    environmentVariableRequest: EnvironmentVariableRequest
    scope: EnvironmentVariableScopeEnum
    toasterCallback?: () => void
  }) => {
    let response
    switch (payload.scope) {
      case EnvironmentVariableScopeEnum.ENVIRONMENT:
        response = await environmentEnvironmentVariableApi.editEnvironmentEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )
        break
      case EnvironmentVariableScopeEnum.PROJECT:
        response = await projectEnvironmentVariableApi.editProjectEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )

        break
      case EnvironmentVariableScopeEnum.APPLICATION:
      default:
        response = await applicationEnvironmentVariableApi.editApplicationEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )
        break
    }
    return response.data
  }
)

export const deleteEnvironmentVariable = createAsyncThunk(
  'environmentVariables/delete',
  async (payload: {
    entityId: string
    environmentVariableId: string
    scope: EnvironmentVariableScopeEnum
    toasterCallback?: () => void
  }) => {
    let response
    switch (payload.scope) {
      case EnvironmentVariableScopeEnum.ENVIRONMENT:
        response = await environmentEnvironmentVariableApi.deleteEnvironmentEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId
        )
        break
      case EnvironmentVariableScopeEnum.PROJECT:
        response = await projectEnvironmentVariableApi.deleteProjectEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId
        )

        break
      case EnvironmentVariableScopeEnum.APPLICATION:
      default:
        response = await applicationEnvironmentVariableApi.deleteApplicationEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId
        )
        break
    }
    return response.data
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
      .addCase(createEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        addVariableToStore(state, action)
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          'Creation success',
          'Your variable has been created. You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(createEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        state.error = action.error.message
        toastError(action.error)
      })
      .addCase(createAliasEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        addVariableToStore(state, action)
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          'Creation success',
          'Your variable has been created. You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(createAliasEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        toastError(action.error)
        state.error = action.error.message
      })
      .addCase(createOverrideEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        addVariableToStore(state, action)
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          'Creation success',
          'Your variable has been created. You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(createOverrideEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        toastError(action.error)
        state.error = null
        state.error = action.error.message
      })
      .addCase(editEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        const extendedEnv: EnvironmentVariableEntity = {
          ...action.payload,
          variable_type: 'public',
          service_name: action.payload.service_name || '',
        }
        environmentVariablesAdapter.updateOne(state, {
          id: extendedEnv.id,
          changes: extendedEnv,
        })
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          'Edition success',
          'You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(editEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        state.error = action.error.message
        toastError(action.error)
      })
      .addCase(deleteEnvironmentVariable.fulfilled, (state: EnvironmentVariablesState, action) => {
        let name = state.entities[action.meta.arg.environmentVariableId]?.key
        if (name && name.length > 30) {
          name = name.substring(0, 30) + '...'
        }
        environmentVariablesAdapter.removeOne(state, action.meta.arg.environmentVariableId)
        removeOneToManyRelation(action.meta.arg.environmentVariableId, state.joinApplicationEnvironmentVariable)
        state.error = null
        toast(ToastEnum.SUCCESS, 'Deletion success', `${name} has been deleted`)
      })
      .addCase(deleteEnvironmentVariable.rejected, (state: EnvironmentVariablesState, action) => {
        state.error = action.error.message
        toastError(action.error)
      })
  },
})

export const addVariableToStore = (state: EnvironmentVariablesState, action: any) => {
  if (!action.payload || !action.meta.arg) return

  const extendedEnv: EnvironmentVariableEntity = {
    ...action.payload,
    variable_type: 'public',
    service_name: action.payload.service_name || '',
    is_new: true,
  }
  environmentVariablesAdapter.addOne(state, extendedEnv)

  state.joinApplicationEnvironmentVariable = addOneToManyRelation(action.meta.arg.applicationId, extendedEnv.id, {
    ...state.joinApplicationEnvironmentVariable,
  })
  state.loadingStatus = 'loaded'
}

export const environmentVariables = environmentVariablesSlice.reducer

export const environmentVariablesActions = environmentVariablesSlice.actions

const { selectAll, selectEntities } = environmentVariablesAdapter.getSelectors()

export const getEnvironmentVariablesState = (rootState: RootState): EnvironmentVariablesState =>
  rootState['entities']['environmentVariable'][ENVIRONMENT_VARIABLES_FEATURE_KEY]

export const selectAllEnvironmentVariables = createSelector(getEnvironmentVariablesState, selectAll)

export const selectEnvironmentVariablesEntities = createSelector(getEnvironmentVariablesState, selectEntities)

export const selectEnvironmentVariablesByApplicationId = createSelector(
  [getEnvironmentVariablesState, (state, applicationId: string) => applicationId],
  (state, applicationId) => {
    const variables = getEntitiesByIds<EnvironmentVariableEntity>(
      state.entities,
      state.joinApplicationEnvironmentVariable[applicationId]
    )

    return variables
  }
)
