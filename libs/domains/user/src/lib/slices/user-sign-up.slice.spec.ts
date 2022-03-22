import { fetchUserSignUp, userSignUpAdapter, userSignUpReducer } from './user.slice'

describe('user reducer', () => {
  it('should handle initial state', () => {
    const expected = userSignUpAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(userSignUpReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchUserSignUps', () => {
    let state = userSignUpReducer(undefined, fetchUserSignUp.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = userSignUpReducer(state, fetchUserSignUp.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = userSignUpReducer(state, fetchUserSignUp.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
