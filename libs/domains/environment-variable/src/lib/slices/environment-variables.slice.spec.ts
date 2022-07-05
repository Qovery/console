import {
  environmentVariables,
  environmentVariablesAdapter,
  fetchEnvironmentVariables,
} from './environment-variables.slice'

describe('environmentVariables reducer', () => {
  it('should handle initial state', () => {
    const expected = environmentVariablesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
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
      })
    )

    state = environmentVariables(state, fetchEnvironmentVariables.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = environmentVariables(state, fetchEnvironmentVariables.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
