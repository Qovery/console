import { repositoryAdapter, repositoryReducer } from './repository.slice'

describe('repository reducer', () => {
  it('should handle initial state', () => {
    const expected = repositoryAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(repositoryReducer(undefined, { type: '' })).toEqual(expected)
  })
})
