import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllEnvironments, fetchEnvironments } from './../slices/environments.slice'

export function useEnviroments() {
  const dispatch = useDispatch<any>()
  const environments = useSelector(selectAllEnvironments)

  const getEnvironments = useCallback(
    async (projectId: string) => dispatch(fetchEnvironments({ projectId })),
    [dispatch]
  )

  const getEnvironmentsStatus = useCallback(
    async (projectId: string) => dispatch(fetchEnvironments({ projectId })),
    [dispatch]
  )

  return { environments, getEnvironments }
}
