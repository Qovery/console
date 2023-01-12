import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import {
  APIVariableScopeEnum,
  ApplicationEnvironmentVariableApi,
  ContainerEnvironmentVariableApi,
  EnvironmentVariableApi,
  EnvironmentVariableRequest,
  JobEnvironmentVariableApi,
  ProjectEnvironmentVariableApi,
  Value,
  VariableImport,
  VariableImportRequestVars,
} from 'qovery-typescript-axios'
import { Key } from 'qovery-typescript-axios/api'
import { ServiceTypeEnum, isContainer, isJob } from '@qovery/shared/enums'
import { EnvironmentVariableEntity, EnvironmentVariablesState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const ENVIRONMENT_VARIABLES_FEATURE_KEY = 'public'
export const environmentVariablesAdapter = createEntityAdapter<EnvironmentVariableEntity>()

const applicationEnvironmentVariableApi = new ApplicationEnvironmentVariableApi()
const containerEnvironmentVariableApi = new ContainerEnvironmentVariableApi()
const jobEnvironmentVariableApi = new JobEnvironmentVariableApi()
const environmentEnvironmentVariableApi = new EnvironmentVariableApi()
const projectEnvironmentVariableApi = new ProjectEnvironmentVariableApi()

export const fetchEnvironmentVariables = createAsyncThunk(
  'environmentVariables/list',
  async (payload: { applicationId: string; serviceType: ServiceTypeEnum }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await containerEnvironmentVariableApi.listContainerEnvironmentVariable(payload.applicationId)
    } else if (isJob(payload.serviceType)) {
      response = await jobEnvironmentVariableApi.listJobEnvironmentVariable(payload.applicationId)
    } else {
      response = await applicationEnvironmentVariableApi.listApplicationEnvironmentVariable(payload.applicationId)
    }

    return response.data.results as EnvironmentVariableEntity[]
  }
)

export const importEnvironmentVariables = createAsyncThunk(
  'environmentVariables/import',
  async (payload: {
    applicationId: string
    vars: VariableImportRequestVars[]
    overwriteEnabled: boolean
    serviceType: ServiceTypeEnum
  }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await containerEnvironmentVariableApi.importContainerEnvironmentVariable(payload.applicationId, {
        overwrite: payload.overwriteEnabled,
        vars: payload.vars,
      })
    } else if (isJob(payload.serviceType)) {
      response = await jobEnvironmentVariableApi.importJobEnvironmentVariable(payload.applicationId, {
        overwrite: payload.overwriteEnabled,
        vars: payload.vars,
      })
    } else {
      response = await applicationEnvironmentVariableApi.importEnvironmentVariable(payload.applicationId, {
        overwrite: payload.overwriteEnabled,
        vars: payload.vars,
      })
    }

    return response.data as VariableImport
  }
)

export const createEnvironmentVariablePayloadCreator = async (payload: {
  entityId: string
  applicationId: string
  environmentVariableRequest: EnvironmentVariableRequest
  scope: APIVariableScopeEnum
  serviceType: ServiceTypeEnum
  toasterCallback?: () => void
}) => {
  let response
  switch (payload.scope) {
    case APIVariableScopeEnum.ENVIRONMENT:
      response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariable(
        payload.entityId,
        payload.environmentVariableRequest
      )
      break
    case APIVariableScopeEnum.PROJECT:
      response = await projectEnvironmentVariableApi.createProjectEnvironmentVariable(
        payload.entityId,
        payload.environmentVariableRequest
      )

      break
    case APIVariableScopeEnum.APPLICATION:
    case APIVariableScopeEnum.CONTAINER:
    case APIVariableScopeEnum.JOB:
    default:
      if (isContainer(payload.serviceType)) {
        response = await containerEnvironmentVariableApi.createContainerEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableRequest
        )
      } else if (isJob(payload.serviceType)) {
        response = await jobEnvironmentVariableApi.createJobEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableRequest
        )
      } else {
        response = await applicationEnvironmentVariableApi.createApplicationEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableRequest
        )
      }
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
  scope: APIVariableScopeEnum
  serviceType: ServiceTypeEnum
  toasterCallback?: () => void
}) => {
  const { entityId, environmentVariableId, environmentVariableRequest } = payload
  let response
  switch (payload.scope) {
    case APIVariableScopeEnum.ENVIRONMENT:
      response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariableOverride(
        entityId,
        environmentVariableId,
        environmentVariableRequest
      )
      break
    case APIVariableScopeEnum.PROJECT:
      response = await projectEnvironmentVariableApi.createProjectEnvironmentVariableOverride(
        entityId,
        environmentVariableId,
        environmentVariableRequest
      )
      break
    case APIVariableScopeEnum.APPLICATION:
    case APIVariableScopeEnum.CONTAINER:
    case APIVariableScopeEnum.JOB:
    default:
      if (isContainer(payload.serviceType)) {
        response = await containerEnvironmentVariableApi.createContainerEnvironmentVariableOverride(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
      } else if (isJob(payload.serviceType)) {
        response = await jobEnvironmentVariableApi.createJobEnvironmentVariableOverride(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
      } else {
        response = await applicationEnvironmentVariableApi.createApplicationEnvironmentVariableOverride(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
      }
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
    scope: APIVariableScopeEnum
    serviceType: ServiceTypeEnum
    toasterCallback?: () => void
  }) => {
    const { entityId, environmentVariableId, environmentVariableRequest } = payload
    let response
    switch (payload.scope) {
      case APIVariableScopeEnum.ENVIRONMENT:
        response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariableAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectEnvironmentVariableApi.createProjectEnvironmentVariableAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case APIVariableScopeEnum.APPLICATION:
      case APIVariableScopeEnum.CONTAINER:
      case APIVariableScopeEnum.JOB:
      default:
        if (isContainer(payload.serviceType)) {
          response = await containerEnvironmentVariableApi.createContainerEnvironmentVariableAlias(
            entityId,
            environmentVariableId,
            environmentVariableRequest
          )
        } else if (isJob(payload.serviceType)) {
          response = await jobEnvironmentVariableApi.createJobEnvironmentVariableAlias(
            entityId,
            environmentVariableId,
            environmentVariableRequest
          )
        } else {
          response = await applicationEnvironmentVariableApi.createApplicationEnvironmentVariableAlias(
            entityId,
            environmentVariableId,
            environmentVariableRequest
          )
        }
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
    scope: APIVariableScopeEnum
    serviceType: ServiceTypeEnum
    toasterCallback?: () => void
  }) => {
    let response
    switch (payload.scope) {
      case APIVariableScopeEnum.ENVIRONMENT:
        response = await environmentEnvironmentVariableApi.editEnvironmentEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectEnvironmentVariableApi.editProjectEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )

        break
      case APIVariableScopeEnum.APPLICATION:
      case APIVariableScopeEnum.CONTAINER:
      case APIVariableScopeEnum.JOB:
      default:
        if (isContainer(payload.serviceType)) {
          response = await containerEnvironmentVariableApi.editContainerEnvironmentVariable(
            payload.entityId,
            payload.environmentVariableId,
            payload.environmentVariableRequest
          )
        } else if (isJob(payload.serviceType)) {
          response = await jobEnvironmentVariableApi.editJobEnvironmentVariable(
            payload.entityId,
            payload.environmentVariableId,
            payload.environmentVariableRequest
          )
        } else {
          response = await applicationEnvironmentVariableApi.editApplicationEnvironmentVariable(
            payload.entityId,
            payload.environmentVariableId,
            payload.environmentVariableRequest
          )
        }
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
    scope: APIVariableScopeEnum
    serviceType: ServiceTypeEnum
    toasterCallback?: () => void
  }) => {
    let response
    switch (payload.scope) {
      case APIVariableScopeEnum.ENVIRONMENT:
        response = await environmentEnvironmentVariableApi.deleteEnvironmentEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId
        )
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectEnvironmentVariableApi.deleteProjectEnvironmentVariable(
          payload.entityId,
          payload.environmentVariableId
        )

        break
      case APIVariableScopeEnum.APPLICATION:
      case APIVariableScopeEnum.CONTAINER:
      case APIVariableScopeEnum.JOB:
      default:
        if (isContainer(payload.serviceType)) {
          response = await containerEnvironmentVariableApi.deleteContainerEnvironmentVariable(
            payload.entityId,
            payload.environmentVariableId
          )
        } else if (isJob(payload.serviceType)) {
          response = await jobEnvironmentVariableApi.deleteJobEnvironmentVariable(
            payload.entityId,
            payload.environmentVariableId
          )
        } else {
          response = await applicationEnvironmentVariableApi.deleteApplicationEnvironmentVariable(
            payload.entityId,
            payload.environmentVariableId
          )
        }
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
          state.joinApplicationEnvironmentVariable = addOneToManyRelation(action.meta.arg.applicationId, secret.id, {
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
      .addCase(importEnvironmentVariables.pending, (state: EnvironmentVariablesState, action) => {
        state.loadingStatus = 'loading'
      })
      .addCase(importEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        state.error = null
        state.loadingStatus = 'loaded'
        const nbSuccess = action.payload.successful_imported_variables.length
        const nbTotal = action.payload.total_variables_to_import
        toast(
          ToastEnum.SUCCESS,
          'Creation success',
          `${nbSuccess} out of ${nbTotal} variables have been imported successfully`
        )
      })
      .addCase(importEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        toastError(action.error)
        state.error = action.error.message
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
  rootState['environmentVariable'][ENVIRONMENT_VARIABLES_FEATURE_KEY]

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
