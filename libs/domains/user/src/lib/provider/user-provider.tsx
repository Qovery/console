import posthog from 'posthog-js'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchUserSignUp,
  postUserSignUp,
  selectUserLoadingStatus,
  selectUserSignUp,
} from '../slices/user-sign-up.slice'
import { SignUpRequest } from 'qovery-typescript-axios'
import { AppDispatch } from '@console/store/data'
import { selectUser } from '../slices'

export function useUser() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector(selectUser)
  const userSignUp = useSelector(selectUserSignUp)
  const loadingStatus = useSelector(selectUserLoadingStatus)

  const getUserSignUp = useCallback(() => dispatch(fetchUserSignUp()), [dispatch])
  const updateUserSignUp = async (payload: SignUpRequest) => {
    const result = await dispatch(postUserSignUp(payload)).unwrap()

    // if (process.env['NODE_ENV'] === 'production') {
    // update user posthog
    posthog.identify(user.sub, {
      ...result,
    })
    // }

    return result
  }

  return { user, getUserSignUp, userSignUp, updateUserSignUp, loadingStatus }
}
