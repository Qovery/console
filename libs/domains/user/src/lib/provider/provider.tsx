import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '../slices/user.slice'
import { fetchUserSignUp, selectUserSignUp, postUserSignUp, UserSignUpState } from '../slices/user-sign-up.slice'

export function useUser() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const userSignUp = useSelector(selectUserSignUp)

  const updateUserSignUp = (payload: UserSignUpState) => {
    dispatch(postUserSignUp(payload))
  }

  useEffect(() => {
    dispatch(fetchUserSignUp())
  }, [dispatch])

  return { user, userSignUp, updateUserSignUp }
}
