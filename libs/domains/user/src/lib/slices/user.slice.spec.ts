import { initialUserState, userSlice } from './user.slice'

describe('user reducer', () => {
  it('should handle initial state', () => {
    const expected = userSlice.getInitialState()

    expect(initialUserState).toEqual(expected)
  })
})
