import { authProviderAdapter, authProviderReducer, fetchAuthProvider } from './auth-provider.slice'

describe('authProvider reducer', () => {
  it('should handle initial state', () => {
    const expected = authProviderAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(authProviderReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchAuthProviders', () => {
    let state = authProviderReducer(undefined, fetchAuthProvider.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = authProviderReducer(state, fetchAuthProvider.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = authProviderReducer(state, fetchAuthProvider.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
