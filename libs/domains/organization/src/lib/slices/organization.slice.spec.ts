import { fetchOrganization, organizationAdapter, organizationReducer } from './organization.slice'

describe('organization reducer', () => {
  it('should handle initial state', () => {
    const expected = organizationAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(organizationReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchOrganization', () => {
    let state = organizationReducer(undefined, fetchOrganization.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = organizationReducer(state, fetchOrganization.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = organizationReducer(state, fetchOrganization.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
