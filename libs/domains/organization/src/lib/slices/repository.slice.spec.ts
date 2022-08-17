import { fetchRepository, repositoryAdapter, repositoryReducer } from './repository.slice'

describe('repository reducer', () => {
  it('should handle initial state', () => {
    const expected = repositoryAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(repositoryReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchRepositorys', () => {
    let state = repositoryReducer(undefined, fetchRepository.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = repositoryReducer(state, fetchRepository.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = repositoryReducer(state, fetchRepository.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
