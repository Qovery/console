import { fetchOrganizations, organizationsAdapter, organizationsReducer } from './organizations.slice'

describe('organizations reducer', () => {
  it('should handle initial state', () => {
    const expected = organizationsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(organizationsReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchOrganizationss', () => {
    let state = organizationsReducer(undefined, fetchOrganizations.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = organizationsReducer(state, fetchOrganizations.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = organizationsReducer(state, fetchOrganizations.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
