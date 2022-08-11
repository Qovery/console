import { customDomainAdapter, customDomainReducer } from './custom-domain.slice'

describe('customDomain reducer', () => {
  it('should handle initial state', () => {
    const expected = customDomainAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinApplicationCustomDomain: {},
    })

    expect(customDomainReducer(undefined, { type: '' })).toEqual(expected)
  })
})
