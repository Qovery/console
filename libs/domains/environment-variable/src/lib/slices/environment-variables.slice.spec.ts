import { configureStore } from '@reduxjs/toolkit'
import {
  APIVariableScopeEnum,
  ApplicationEnvironmentVariableApi,
  EnvironmentVariableApi,
  ProjectEnvironmentVariableApi,
} from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { mockEnvironmentVariable } from '@qovery/shared/factories'
import { EnvironmentVariablesState } from '@qovery/shared/interfaces'
import { toast } from '@qovery/shared/ui'
import {
  addVariableToStore,
  createAliasEnvironmentVariables,
  createEnvironmentVariablePayloadCreator,
  createEnvironmentVariables,
  createOverrideEnvironmentVariables,
  createOverrideEnvironmentVariablesPayloadCreator,
  deleteEnvironmentVariable,
  editEnvironmentVariables,
  environmentVariables,
  environmentVariablesAdapter,
  fetchEnvironmentVariables,
} from './environment-variables.slice'

jest.mock('@qovery/shared/ui')

describe('environmentVariables reducer', () => {
  const mockToast = toast.mockImplementation(jest.fn())
  const mockToastError = toast.mockImplementation(jest.fn())

  it('should handle initial state', () => {
    const expected = environmentVariablesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinApplicationEnvironmentVariable: {},
    })

    expect(environmentVariables(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchEnvironmentVariables', () => {
    const applicationId = '123'
    const serviceType = ServiceTypeEnum.APPLICATION
    let state = environmentVariables(undefined, fetchEnvironmentVariables.pending('', { applicationId, serviceType }))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
        joinApplicationEnvironmentVariable: {},
      })
    )

    const environmentVariable = mockEnvironmentVariable(false, false)
    state = environmentVariables(
      state,
      fetchEnvironmentVariables.fulfilled([environmentVariable], '', { applicationId, serviceType })
    )

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        joinApplicationEnvironmentVariable: {
          [applicationId]: [environmentVariable.id],
        },
      })
    )

    expect(state.entities[environmentVariable.id]).toStrictEqual(environmentVariable)

    state = environmentVariables(state, fetchEnvironmentVariables.rejected(new Error('Uh oh'), '', null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
      })
    )
  })

  it('should handle createEnvironmentVariable', () => {
    const envVariable = mockEnvironmentVariable(false, false)
    envVariable.is_new = true
    let state = environmentVariables(undefined, createEnvironmentVariables.fulfilled(envVariable, '', {}))

    expect(mockToast).toHaveBeenCalled()
    expect(state.entities[envVariable.id]).toStrictEqual(envVariable)
    expect(state.error).toBeNull()

    state = environmentVariables(state, createEnvironmentVariables.rejected(new Error('Uh oh'), null, null))
    expect(state.error).toBe('Uh oh')

    expect(mockToastError).toHaveBeenCalled()
  })

  it('should handle createAliasEnvironmentVariables', () => {
    const envVariable = mockEnvironmentVariable(false, false)
    envVariable.is_new = true
    let state = environmentVariables(undefined, createAliasEnvironmentVariables.fulfilled(envVariable, '', {}))

    expect(mockToast).toHaveBeenCalled()
    expect(state.entities[envVariable.id]).toStrictEqual(envVariable)
    expect(state.error).toBeNull()

    state = environmentVariables(state, createAliasEnvironmentVariables.rejected(new Error('Uh oh'), null, null))
    expect(state.error).toBe('Uh oh')

    expect(mockToastError).toHaveBeenCalled()
  })

  it('should handle createOverrideEnvironmentVariables', () => {
    const envVariable = mockEnvironmentVariable(false, false)
    envVariable.is_new = true
    let state = environmentVariables(undefined, createOverrideEnvironmentVariables.fulfilled(envVariable, '', {}))

    expect(mockToast).toHaveBeenCalled()
    expect(state.entities[envVariable.id]).toStrictEqual(envVariable)
    expect(state.error).toBeNull()

    state = environmentVariables(state, createOverrideEnvironmentVariables.rejected(new Error('Uh oh'), null, null))
    expect(state.error).toBe('Uh oh')

    expect(mockToastError).toHaveBeenCalled()
  })

  it('should handle editEnvironmentVariables', () => {
    const envVariable = mockEnvironmentVariable(false, false)
    let state = environmentVariables(
      {
        joinApplicationEnvironmentVariable: {},
        entities: {
          [envVariable.id]: envVariable,
        },
        error: null,
        loadingStatus: 'not loaded',
        ids: [envVariable.id],
      },
      editEnvironmentVariables.fulfilled(envVariable, '', {})
    )

    expect(mockToast).toHaveBeenCalled()
    expect(state.entities[envVariable.id]).toStrictEqual(envVariable)
    expect(state.error).toBeNull()

    state = environmentVariables(state, editEnvironmentVariables.rejected(new Error('Uh oh'), null, null))
    expect(state.error).toBe('Uh oh')

    expect(mockToastError).toHaveBeenCalled()
  })

  it('should handle deleteEnvironmentVariable', () => {
    const envVariable = mockEnvironmentVariable(false, false)
    let state = environmentVariables(
      {
        joinApplicationEnvironmentVariable: { '123': [envVariable.id] },
        entities: {
          [envVariable.id]: envVariable,
        },
        error: null,
        loadingStatus: 'not loaded',
        ids: [envVariable.id],
      },
      deleteEnvironmentVariable.fulfilled(undefined, '', { environmentVariableId: envVariable.id })
    )

    expect(mockToast).toHaveBeenCalled()
    expect(state.entities[envVariable.id]).toBeUndefined()
    expect(state.error).toBeNull()

    expect(state.joinApplicationEnvironmentVariable['123']).toEqual([])

    state = environmentVariables(state, deleteEnvironmentVariable.rejected(new Error('Uh oh'), null, null))
    expect(state.error).toBe('Uh oh')

    expect(mockToastError).toHaveBeenCalled()
  })
})

describe('create variable at any scope', () => {
  it('should handle create variable at environment scope', async () => {
    const createEnvironmentEnvironmentVariableMock = jest
      .spyOn(EnvironmentVariableApi.prototype, 'createEnvironmentEnvironmentVariable')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createEnvironmentVariablePayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.ENVIRONMENT,
    })

    expect(createEnvironmentEnvironmentVariableMock).toHaveBeenCalled()
  })

  it('should handle create variable at application scope', async () => {
    const createApplicationEnvironmentVariableMock = jest
      .spyOn(ApplicationEnvironmentVariableApi.prototype, 'createApplicationEnvironmentVariable')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createEnvironmentVariablePayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.APPLICATION,
    })

    expect(createApplicationEnvironmentVariableMock).toHaveBeenCalled()
  })

  it('should handle create variable at project scope', async () => {
    const createApplicationEnvironmentVariableMock = jest
      .spyOn(ProjectEnvironmentVariableApi.prototype, 'createProjectEnvironmentVariable')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createEnvironmentVariablePayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.PROJECT,
    })

    expect(createApplicationEnvironmentVariableMock).toHaveBeenCalled()
  })
})

describe('create override at any scope', () => {
  it('should handle create override at environment scope', async () => {
    const createEnvironmentEnvironmentVariableMock = jest
      .spyOn(EnvironmentVariableApi.prototype, 'createEnvironmentEnvironmentVariableOverride')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createOverrideEnvironmentVariablesPayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.ENVIRONMENT,
    })

    expect(createEnvironmentEnvironmentVariableMock).toHaveBeenCalled()
  })

  it('should handle create variable at application scope', async () => {
    const createApplicationEnvironmentVariableMock = jest
      .spyOn(ApplicationEnvironmentVariableApi.prototype, 'createApplicationEnvironmentVariableOverride')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createOverrideEnvironmentVariablesPayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.APPLICATION,
    })

    expect(createApplicationEnvironmentVariableMock).toHaveBeenCalled()
  })

  it('should handle create variable at project scope', async () => {
    const createApplicationEnvironmentVariableMock = jest
      .spyOn(ProjectEnvironmentVariableApi.prototype, 'createProjectEnvironmentVariableOverride')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createOverrideEnvironmentVariablesPayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.PROJECT,
    })

    expect(createApplicationEnvironmentVariableMock).toHaveBeenCalled()
  })
})

describe('create alias at any scope', () => {
  beforeAll(() => {
    const store = configureStore({
      reducer: function (state = '', action) {
        switch (action.type) {
          case 'returns ID/fulfilled':
            return action.payload
          default:
            return state
        }
      },
    })
  })

  it('should handle create override at environment scope', async () => {
    const createEnvironmentEnvironmentVariableMock = jest
      .spyOn(EnvironmentVariableApi.prototype, 'createEnvironmentEnvironmentVariableOverride')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createOverrideEnvironmentVariablesPayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.ENVIRONMENT,
    })

    expect(createEnvironmentEnvironmentVariableMock).toHaveBeenCalled()
  })

  it('should handle create variable at application scope', async () => {
    const createApplicationEnvironmentVariableMock = jest
      .spyOn(ApplicationEnvironmentVariableApi.prototype, 'createApplicationEnvironmentVariableOverride')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createOverrideEnvironmentVariablesPayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.APPLICATION,
    })

    expect(createApplicationEnvironmentVariableMock).toHaveBeenCalled()
  })

  it('should handle create variable at project scope', async () => {
    const createApplicationEnvironmentVariableMock = jest
      .spyOn(ProjectEnvironmentVariableApi.prototype, 'createProjectEnvironmentVariableOverride')
      .mockImplementation(() => {
        return { data: {} }
      })

    await createOverrideEnvironmentVariablesPayloadCreator({
      entityId: 'sdsd',
      environmentVariableRequest: {
        key: 'key',
        value: 'value',
      },
      scope: APIVariableScopeEnum.PROJECT,
    })

    expect(createApplicationEnvironmentVariableMock).toHaveBeenCalled()
  })
})

describe('testing add variable to store function', () => {
  let state: EnvironmentVariablesState
  beforeAll(() => {
    state = environmentVariablesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinApplicationEnvironmentVariable: {},
    })
  })

  it('should do nothing if payload is undefined', () => {
    const action = {}

    addVariableToStore(state, action)
  })

  it('should execute everything if action well set', () => {
    const action = {
      payload: {},
      meta: {
        arg: {},
      },
    }

    addVariableToStore(state, action)
  })
})
