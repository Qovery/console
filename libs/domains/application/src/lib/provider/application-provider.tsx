import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchApplication } from '../slices/applications.slice'

export function useApplication() {
  const dispatch = useDispatch()

  const getApplication = useCallback(
    async (applicationId: string) => dispatch(fetchApplication({ applicationId })),
    [dispatch]
  )

  return { getApplication }
}
