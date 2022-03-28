import { fetchOrganization, organization, organizationAdapter } from './organization.slice'

describe('organization reducer', () => {
  it('should handle initial state', () => {
    const expected = organizationAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(organization(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchOrganization', async () => {
    let state = organization(undefined, fetchOrganization.pending('mdr'))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = organization(state, fetchOrganization.fulfilled([{ id: 1 }], 'fulfilled'))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = organization(state, fetchOrganization.rejected(new Error('Uh oh'), 'rejected'))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
