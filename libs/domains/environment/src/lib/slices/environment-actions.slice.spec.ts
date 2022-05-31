import {
  fetchEnvironmentActions,
  environmentActionsAdapter,
  environmentActionsReducer,
} from './environment-actions.slice'

describe('environmentActions reducer', () => {
  it('should handle initial state', () => {
    const expected = environmentActionsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(environmentActionsReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchEnvironmentActionss', () => {
    let state = environmentActionsReducer(undefined, fetchEnvironmentActions.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = environmentActionsReducer(state, fetchEnvironmentActions.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = environmentActionsReducer(state, fetchEnvironmentActions.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
