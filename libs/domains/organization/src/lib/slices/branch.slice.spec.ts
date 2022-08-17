import { branchAdapter, branchReducer, fetchBranches } from './branch.slice'

describe('branch reducer', () => {
  it('should handle initial state', () => {
    const expected = branchAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(branchReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchBranchs', () => {
    let state = branchReducer(undefined, fetchBranches.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = branchReducer(state, fetchBranches.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = branchReducer(state, fetchBranches.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
