import { fetchOrganizations, organizations, organizationsAdapter } from './organizations.slice'

describe('organizations reducer', () => {
  it('should handle initial state', () => {
    const expected = organizationsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(organizations(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchOrganizationss', async () => {
    let state = organizations(undefined, fetchOrganizations.pending('mdr'))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = organizations(state, fetchOrganizations.fulfilled([{ id: 1 }], 'fulfilled'))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = organizations(state, fetchOrganizations.rejected(new Error('Uh oh'), 'rejected'))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
