import { clusterAdapter, clusterReducer } from './cluster.slice'

describe('cluster reducer', () => {
  it('should handle initial state', () => {
    const expected = clusterAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinOrganizationClusters: {},
      statusLoadingStatus: 'not loaded',
    })

    expect(clusterReducer(undefined, { type: '' })).toEqual(expected)
  })
})
