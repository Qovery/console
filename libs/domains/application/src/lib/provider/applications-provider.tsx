import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchApplications,
  fetchApplicationsStatus,
  removeOneApplication,
  selectAllApplications,
} from '../slices/applications.slice'
import { AppDispatch } from '@console/store/data'

export function useApplications() {
  const dispatch = useDispatch<AppDispatch>()
  const applications = useSelector(selectAllApplications)

  const removeApplication = useCallback(
    async (applicationId: string) => dispatch(removeOneApplication({ applicationId })),
    [dispatch]
  )

  const getApplications = useCallback(
    async (environmentId: string, withoutStatus = false) =>
      dispatch(fetchApplications({ environmentId, withoutStatus })),
    [dispatch]
  )

  const getApplicationsStatus = useCallback(
    async (environmentId: string) => dispatch(fetchApplicationsStatus({ environmentId })),
    [dispatch]
  )

  return { applications, getApplications, removeApplication, getApplicationsStatus }
}
