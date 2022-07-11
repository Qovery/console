import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import {
  ApplicationEnvironmentVariableApi,
  EnvironmentVariableApi,
  EnvironmentVariableRequest,
  EnvironmentVariableScopeEnum,
  ProjectEnvironmentVariableApi,
} from 'qovery-typescript-axios'

import { RootState } from '@console/store/data'
import { EnvironmentVariableEntity, EnvironmentVariablesState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'
import { toast, ToastEnum } from '@console/shared/toast'

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
  async (
    payload: {
      entityId: string
      environmentVariableRequest: EnvironmentVariableRequest
      scope: EnvironmentVariableScopeEnum
    },
    { rejectWithValue }
  ) => {
    console.log('CREATE ENV VARIABLE')
    const response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariable(
      payload.entityId,
      payload.environmentVariableRequest
    )
    console.log(response)
    return response.data

    // switch (payload.scope) {
    //   case EnvironmentVariableScopeEnum.ENVIRONMENT:
    //     console.log('ENVIRONMENT')
    //     try {
    //       response = await environmentEnvironmentVariableApi.createEnvironmentEnvironmentVariable(
    //         payload.entityId,
    //         payload.environmentVariableRequest
    //       )
    //
    //       return response.data
    //     } catch (err) {
    //       console.log(err)
    //       return rejectWithValue(err)
    //     }
    //     break
    //   case EnvironmentVariableScopeEnum.PROJECT:
    //     response = await projectEnvironmentVariableApi.createProjectEnvironmentVariable(
    //       payload.entityId,
    //       payload.environmentVariableRequest
    //     )
    //     return response.data
    //     break
    //   case EnvironmentVariableScopeEnum.APPLICATION:
    //   default:
    //     response = await applicationEnvironmentVariableApi.createApplicationEnvironmentVariable(
    //       payload.entityId,
    //       payload.environmentVariableRequest
    //     )
    //     return response.data
    //     break
    // }
  }
)

export const createOverrideEnvironmentVariables = createAsyncThunk(
  'environmentVariables/create-override',
  async (payload: {
    entityId: string
    environmentVariableId: string
    environmentVariableRequest: EnvironmentVariableRequest
    scope: EnvironmentVariableScopeEnum
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
    environmentVariableId: string
    environmentVariableRequest: EnvironmentVariableRequest
    scope: EnvironmentVariableScopeEnum
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
        console.log('normal')
        addVariableToStore(state, action)
        toast(ToastEnum.SUCCESS, 'Creation success', 'Your environment variable has been created successfully')
      })
      .addCase(createEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        console.log('rejected')
        toast(ToastEnum.ERROR, 'Creation Failed', action.error.message)
      })
      .addCase(createAliasEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        console.log('alias')
        addVariableToStore(state, action)
        toast(ToastEnum.SUCCESS, 'Creation success', 'Your environment variable override has been created successfully')
      })
      .addCase(createAliasEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        toast(ToastEnum.ERROR, 'Creation Failed', action.error.message)
      })
      .addCase(createOverrideEnvironmentVariables.fulfilled, (state: EnvironmentVariablesState, action) => {
        console.log('override')
        addVariableToStore(state, action)
        toast(ToastEnum.SUCCESS, 'Creation success', 'Your environment variable alias has been created successfully')
      })
      .addCase(createOverrideEnvironmentVariables.rejected, (state: EnvironmentVariablesState, action) => {
        toast(ToastEnum.ERROR, 'Creation Failed', action.error.message)
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

  state.joinApplicationEnvironmentVariable = addOneToManyRelation(action.meta.arg.entityId, extendedEnv.id, {
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
