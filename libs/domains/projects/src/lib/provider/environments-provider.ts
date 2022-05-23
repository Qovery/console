import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchEnvironments,
  fetchEnvironmentsStatus,
  selectAllEnvironments,
} from 'libs/domains/environment/src/lib/slices/environments.slice'
import { AppDispatch } from '@console/store/data'

export function useEnvironments() {
  const dispatch = useDispatch<AppDispatch>()
  const environments = useSelector(selectAllEnvironments)

  const getEnvironments = useCallback(
    async (projectId: string, withoutStatus = false) => dispatch(fetchEnvironments({ projectId, withoutStatus })),
    [dispatch]
  )

  const getEnvironmentsStatus = useCallback(
    async (projectId: string) => dispatch(fetchEnvironmentsStatus({ projectId })),
    [dispatch]
  )

  return { environments, getEnvironments, getEnvironmentsStatus }
}
