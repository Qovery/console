import { availableContainerRegistryReducer } from './available-container-registry.slice'

describe('availableContainerRegistry reducer', () => {
  it('should handle initial state', () => {
    const expected = {
      loadingStatus: 'not loaded',
      error: null,
      items: [],
    }

    expect(availableContainerRegistryReducer(undefined, { type: '' })).toEqual(expected)
  })
})
