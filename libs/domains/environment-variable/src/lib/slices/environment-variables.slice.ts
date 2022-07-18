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
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'
import { errorToaster, toast, ToastEnum } from '@console/shared/toast'
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

export const createEnvironmentVariables = createAsyncThunk(
  'environmentVariables/create',
  async (payload: {
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
)

export const createOverrideEnvironmentVariables = createAsyncThunk(
  'environmentVariables/create-override',
  async (payload: {
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
        errorToaster(action.error)
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
        errorToaster(action.error)
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
        errorToaster(action.error)
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
        errorToaster(action.error)
      })
  },
})

const addVariableToStore = (state: EnvironmentVariablesState, action: any) => {
  if (!action.payload) return

  const extendedEnv: EnvironmentVariableEntity = {
    ...action.payload,
    variable_type: 'public',
    service_name: action.payload.service_name || '',
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
