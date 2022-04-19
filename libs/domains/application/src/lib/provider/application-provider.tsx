import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchApplication, selectApplication } from '../slices/application.slice'

export function useApplication() {
  const dispatch = useDispatch<any>()
  const application = useSelector(selectApplication)

  const getApplication = useCallback(
    async (applicationId: string) => dispatch(fetchApplication({ applicationId })),
    [dispatch]
  )

  return { application, getApplication }
}
