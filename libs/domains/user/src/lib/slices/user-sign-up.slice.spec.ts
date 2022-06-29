import { initialUserSignUpState } from './user-sign-up.slice'
import { TypeOfUseEnum } from 'qovery-typescript-axios'

describe('user reducer', () => {
  it('should handle initial state', () => {
    const expected = {
      loadingStatus: 'not loaded',
      error: null,
      signup: {
        first_name: '',
        id: '',
        created_at: '',
        user_email: '',
        last_name: '',
        qovery_usage: '',
        type_of_use: TypeOfUseEnum.PERSONAL,
      },
    }
    expect(initialUserSignUpState).toEqual(expected)
  })

  // it('should handle postUserSignUp', () => {
  //   let state = userSignUp(undefined, postUserSignUp.pending(null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loading',
  //       error: null,
  //     })
  //   )
  //
  //   state = userSignUp(state, postUserSignUp.fulfilled([{ id: 1 }], null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loaded',
  //       error: null,
  //     })
  //   )
  //
  //   state = userSignUp(state, postUserSignUp.rejected(new Error('Uh oh'), null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'error',
  //       error: 'Uh oh',
  //     })
  //   )
  // })
})
