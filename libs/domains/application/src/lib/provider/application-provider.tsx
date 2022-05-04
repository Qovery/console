import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchApplication, selectApplicationById } from '../slices/applications.slice'

export function useApplication() {
  const dispatch = useDispatch<any>()
  const application = (applicationId: string) => useSelector(selectApplicationById(applicationId))

  const getApplication = useCallback(
    async (applicationId: string) => dispatch(fetchApplication({ applicationId })),
    [dispatch]
  )

  return { application, getApplication }
}
