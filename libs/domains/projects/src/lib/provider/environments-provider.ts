import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchEnvironments,
  fetchEnvironmentsStatus,
  selectAllEnvironments,
} from 'libs/domains/environment/src/lib/slices/environments.slice'

export function useEnvironments() {
  const dispatch = useDispatch<any>()
  const environments = useSelector(selectAllEnvironments)

  const getEnvironments = useCallback(
    async (projectId: string) => dispatch(fetchEnvironments({ projectId })),
    [dispatch]
  )

  const getEnvironmentsStatus = useCallback(
    async (projectId: string) => dispatch(fetchEnvironmentsStatus({ projectId })),
    [dispatch]
  )

  return { environments, getEnvironments, getEnvironmentsStatus }
}
