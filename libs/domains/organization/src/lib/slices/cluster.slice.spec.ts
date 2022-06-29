import { clusterAdapter, clusterReducer } from './cluster.slice'

describe('cluster reducer', () => {
  it('should handle initial state', () => {
    const expected = clusterAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinOrganizationClusters: {},
    })

    expect(clusterReducer(undefined, { type: '' })).toEqual(expected)
  })

  // it('should handle fetchClusters', () => {
  //   let state = clusterReducer(undefined, fetchClusters.pending(null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loading',
  //       error: null,
  //       entities: {},
  //     })
  //   )
  //
  //   state = clusterReducer(state, fetchClusters.fulfilled([{ id: 1 }], null, { organizationId: '1' }))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loaded',
  //       error: null,
  //       entities: { 1: { id: 1 } },
  //     })
  //   )
  //
  //   state = clusterReducer(state, fetchClusters.rejected(new Error('Uh oh'), null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'error',
  //       error: 'Uh oh',
  //       entities: { 1: { id: 1 } },
  //     })
  //   )
  // })
})
