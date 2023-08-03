import { authProviderAdapter, authProviderReducer } from './auth-provider.slice'

describe('authProvider reducer', () => {
  it('should handle initial state', () => {
    const expected = authProviderAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(authProviderReducer(undefined, { type: '' })).toEqual(expected)
  })
})
