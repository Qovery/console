import {
  environmentVariables,
  environmentVariablesAdapter,
  fetchEnvironmentVariables,
} from './environment-variables.slice'
import { mockEnvironmentVariable } from '../mocks/factories/environment-variable-factory.mock'

describe('environmentVariables reducer', () => {
  it('should handle initial state', () => {
    const expected = environmentVariablesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinApplicationEnvironmentVariable: {},
    })

    expect(environmentVariables(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchEnvironmentVariabless', () => {
    let state = environmentVariables(undefined, fetchEnvironmentVariables.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
        joinApplicationEnvironmentVariable: {},
      })
    )

    const applicationId = '123'
    const environmentVariable = mockEnvironmentVariable(false, false)
    state = environmentVariables(state, fetchEnvironmentVariables.fulfilled([environmentVariable], null, applicationId))

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

    state = environmentVariables(state, fetchEnvironmentVariables.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
      })
    )
  })
})
