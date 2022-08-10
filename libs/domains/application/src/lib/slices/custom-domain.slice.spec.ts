import { customDomainAdapter, customDomainReducer, fetchCustomDomain } from './custom-domain.slice'

describe('customDomain reducer', () => {
  it('should handle initial state', () => {
    const expected = customDomainAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(customDomainReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchCustomDomains', () => {
    let state = customDomainReducer(undefined, fetchCustomDomain.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = customDomainReducer(state, fetchCustomDomain.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = customDomainReducer(state, fetchCustomDomain.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
