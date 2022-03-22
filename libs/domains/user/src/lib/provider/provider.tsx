import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import toast from 'react-hot-toast'
import { selectUser } from '../slices/user.slice'
import { fetchUserSignUp, selectUserSignUp, postUserSignUp, UserSignUpState } from '../slices/user-sign-up.slice'

export function useUser() {
  const dispatch = useDispatch<any>()
  const user = useSelector(selectUser)
  const userSignUp = useSelector(selectUserSignUp)

  const getUserSignUp = useCallback(() => dispatch(fetchUserSignUp()), [dispatch])
  const updateUserSignUp = async (payload: UserSignUpState) => {
    const result = await dispatch(postUserSignUp(payload)).unwrap()
    // toast.success('Success !')
    return result
  }

  return { user, getUserSignUp, userSignUp, updateUserSignUp }
}
