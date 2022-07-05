import {
  fetchSecretEnvironmentVariables,
  secretEnvironmentVariables,
  secretEnvironmentVariablesAdapter,
} from './secret-environment-variables.slice'

describe('secretEnvironmentVariables reducer', () => {
  it('should handle initial state', () => {
    const expected = secretEnvironmentVariablesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(secretEnvironmentVariables(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchSecretEnvironmentVariabless', () => {
    let state = secretEnvironmentVariables(undefined, fetchSecretEnvironmentVariables.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = secretEnvironmentVariables(state, fetchSecretEnvironmentVariables.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = secretEnvironmentVariables(state, fetchSecretEnvironmentVariables.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
