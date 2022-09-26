import {
  availableContainerRegistryAdapter,
  availableContainerRegistryReducer,
  fetchAvailableContainerRegistry,
} from './available-container-registry.slice'

describe('availableContainerRegistry reducer', () => {
  it('should handle initial state', () => {
    const expected = availableContainerRegistryAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(availableContainerRegistryReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchAvailableContainerRegistrys', () => {
    let state = availableContainerRegistryReducer(undefined, fetchAvailableContainerRegistry.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = availableContainerRegistryReducer(state, fetchAvailableContainerRegistry.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = availableContainerRegistryReducer(
      state,
      fetchAvailableContainerRegistry.rejected(new Error('Uh oh'), null, null)
    )

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
