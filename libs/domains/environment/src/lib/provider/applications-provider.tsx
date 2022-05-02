import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchApplications,
  selectAllApplications,
  selectApplicationsEntitiesByEnvId,
} from '../slices/applications.slice'

export function useApplications() {
  const dispatch = useDispatch<any>()
  const applications = useSelector(selectAllApplications)
  const applicationsByEnv = (environmentId: string) => useSelector(selectApplicationsEntitiesByEnvId(environmentId))

  const getApplications = useCallback(
    async (environmentId: string) => dispatch(fetchApplications({ environmentId })),
    [dispatch]
  )

  return { applications, getApplications, applicationsByEnv }
}
