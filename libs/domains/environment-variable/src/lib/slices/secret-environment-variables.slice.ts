import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import {
  APIVariableScopeEnum,
  ApplicationSecretApi,
  ContainerSecretApi,
  EnvironmentSecretApi,
  EnvironmentVariableRequest,
  JobSecretApi,
  ProjectSecretApi,
  Value,
} from 'qovery-typescript-axios'
import { Key } from 'qovery-typescript-axios/api'
import { ServiceTypeEnum, isContainer, isJob } from '@qovery/shared/enums'
import { SecretEnvironmentVariableEntity, SecretEnvironmentVariablesState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const SECRET_ENVIRONMENT_VARIABLES_FEATURE_KEY = 'secret'

export const secretEnvironmentVariablesAdapter = createEntityAdapter<SecretEnvironmentVariableEntity>()

const applicationSecretApi = new ApplicationSecretApi()
const containerSecretApi = new ContainerSecretApi()
const jobSecretApi = new JobSecretApi()
const environmentSecretApi = new EnvironmentSecretApi()
const projectSecretApi = new ProjectSecretApi()

export const fetchSecretEnvironmentVariables = createAsyncThunk(
  'secretEnvironmentVariables/list',
  async (payload: { applicationId: string; serviceType: ServiceTypeEnum }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await containerSecretApi.listContainerSecrets(payload.applicationId)
    } else if (isJob(payload.serviceType)) {
      response = await jobSecretApi.listJobSecrets(payload.applicationId)
    } else {
      response = await applicationSecretApi.listApplicationSecrets(payload.applicationId)
    }

    return response.data.results as SecretEnvironmentVariableEntity[]
  }
)

export const createSecret = createAsyncThunk(
  'secretEnvironmentVariables/create',
  async (payload: {
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
        response = await environmentSecretApi.createEnvironmentSecret(
          payload.entityId,
          payload.environmentVariableRequest
        )
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectSecretApi.createProjectSecret(payload.entityId, payload.environmentVariableRequest)

        break
      case APIVariableScopeEnum.APPLICATION:
      case APIVariableScopeEnum.CONTAINER:
      case APIVariableScopeEnum.JOB:
      default:
        if (isContainer(payload.serviceType)) {
          response = await containerSecretApi.createContainerSecret(
            payload.entityId,
            payload.environmentVariableRequest
          )
        } else if (isJob(payload.serviceType)) {
          response = await jobSecretApi.createJobSecret(payload.entityId, payload.environmentVariableRequest)
        } else {
          response = await applicationSecretApi.createApplicationSecret(
            payload.entityId,
            payload.environmentVariableRequest
          )
        }
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
    scope: APIVariableScopeEnum
    serviceType: ServiceTypeEnum
    toasterCallback?: () => void
  }) => {
    const { entityId, environmentVariableId, environmentVariableRequest } = payload
    let response
    switch (payload.scope) {
      case APIVariableScopeEnum.ENVIRONMENT:
        response = await environmentSecretApi.createEnvironmentSecretOverride(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectSecretApi.createProjectSecretOverride(
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
          response = await containerSecretApi.createContainerSecretOverride(
            entityId,
            environmentVariableId,
            environmentVariableRequest
          )
        } else if (isJob(payload.serviceType)) {
          response = await jobSecretApi.createJobSecretOverride(
            entityId,
            environmentVariableId,
            environmentVariableRequest
          )
        } else {
          response = await applicationSecretApi.createApplicationSecretOverride(
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

export const createAliasSecret = createAsyncThunk(
  'secretEnvironmentVariables/create-alias',
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
        response = await environmentSecretApi.createEnvironmentSecretAlias(
          entityId,
          environmentVariableId,
          environmentVariableRequest
        )
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectSecretApi.createProjectSecretAlias(
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
          response = await containerSecretApi.createContainerSecretAlias(
            entityId,
            environmentVariableId,
            environmentVariableRequest
          )
        } else if (isJob(payload.serviceType)) {
          response = await jobSecretApi.createJobSecretAlias(
            entityId,
            environmentVariableId,
            environmentVariableRequest
          )
        } else {
          response = await applicationSecretApi.createApplicationSecretAlias(
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

export const editSecret = createAsyncThunk(
  'secretEnvironmentVariables/edit',
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
        response = await environmentSecretApi.editEnvironmentSecret(
          payload.entityId,
          payload.environmentVariableId,
          payload.environmentVariableRequest
        )
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectSecretApi.editProjectSecret(
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
          response = await containerSecretApi.editContainerSecret(
            payload.entityId,
            payload.environmentVariableId,
            payload.environmentVariableRequest
          )
        } else if (isJob(payload.serviceType)) {
          response = await jobSecretApi.editJobSecret(
            payload.entityId,
            payload.environmentVariableId,
            payload.environmentVariableRequest
          )
        } else {
          response = await applicationSecretApi.editApplicationSecret(
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

export const deleteSecret = createAsyncThunk(
  'secretEnvironmentVariables/delete',
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
        response = await environmentSecretApi.deleteEnvironmentSecret(payload.entityId, payload.environmentVariableId)
        break
      case APIVariableScopeEnum.PROJECT:
        response = await projectSecretApi.deleteProjectSecret(payload.entityId, payload.environmentVariableId)

        break
      case APIVariableScopeEnum.APPLICATION:
      case APIVariableScopeEnum.CONTAINER:
      case APIVariableScopeEnum.JOB:
      default:
        if (isContainer(payload.serviceType)) {
          response = await containerSecretApi.deleteContainerSecret(payload.entityId, payload.environmentVariableId)
        } else if (isJob(payload.serviceType)) {
          response = await jobSecretApi.deleteJobSecret(payload.entityId, payload.environmentVariableId)
        } else {
          response = await applicationSecretApi.deleteApplicationSecret(payload.entityId, payload.environmentVariableId)
        }
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
          state.joinApplicationSecretEnvironmentVariable = addOneToManyRelation(
            action.meta.arg.applicationId,
            secret.id,
            {
              ...state.joinApplicationSecretEnvironmentVariable,
            }
          )
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
        toast(
          ToastEnum.SUCCESS,
          'Creation success',
          'You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(createSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        state.error = action.error.message
        toastError(action.error)
      })
      .addCase(createAliasSecret.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        addSecretToStore(state, action)
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          'Creation success',
          'You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(createAliasSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        toastError(action.error)
        state.error = action.error.message
      })
      .addCase(createOverrideSecret.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        addSecretToStore(state, action)
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          'Creation success',
          'You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(createOverrideSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        toastError(action.error)
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
        toast(
          ToastEnum.SUCCESS,
          'Edition success',
          'You need to redeploy your environment for your changes to be applied',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(editSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        state.error = action.error.message
        toastError(action.error)
      })
      .addCase(deleteSecret.fulfilled, (state: SecretEnvironmentVariablesState, action) => {
        let name = state.entities[action.meta.arg.environmentVariableId]?.key
        if (name && name.length > 30) {
          name = name.substring(0, 30) + '...'
        }
        secretEnvironmentVariablesAdapter.removeOne(state, action.meta.arg.environmentVariableId)
        state.error = null
        toast(ToastEnum.SUCCESS, 'Deletion success', `${name} has been deleted`)
      })
      .addCase(deleteSecret.rejected, (state: SecretEnvironmentVariablesState, action) => {
        state.error = action.error.message
        toastError(action.error)
      })
  },
})

const addSecretToStore = (state: SecretEnvironmentVariablesState, action: any) => {
  if (!action.payload) return

  const extendedEnv: SecretEnvironmentVariableEntity = {
    ...action.payload,
    variable_type: 'secret',
    service_name: action.payload.service_name || '',
    is_new: true,
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
  rootState['environmentVariable'][SECRET_ENVIRONMENT_VARIABLES_FEATURE_KEY]

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
