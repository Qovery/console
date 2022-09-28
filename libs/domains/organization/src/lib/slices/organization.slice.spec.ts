import { organization, organizationAdapter } from './organization.slice'

describe('organization reducer', () => {
  it('should handle initial state', () => {
    const expected = organizationAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      availableContainerRegistries: {
        loadingStatus: 'not loaded',
        items: [],
      },
    })

    expect(organization(undefined, { type: '' })).toEqual(expected)
  })
})
