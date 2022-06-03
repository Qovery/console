import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchApplication } from '../slices/applications.slice'
import { AppDispatch } from '@console/store/data'

export function useApplication() {
  const dispatch = useDispatch<AppDispatch>()

  const getApplication = useCallback(
    async (applicationId: string) => dispatch(fetchApplication({ applicationId })),
    [dispatch]
  )

  return { getApplication }
}
