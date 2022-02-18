import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOrganizations,
  selectAllOrganizations,
  selectOrganizationsLoadingStatus,
} from '../slices/organizations.slice'

export function useOrganizations() {
  const dispatch = useDispatch()
  const organizations = useSelector(selectAllOrganizations)
  const loadingStatus = useSelector(selectOrganizationsLoadingStatus)

  useEffect(() => {
    dispatch(fetchOrganizations())
  }, [dispatch])

  return { organizations, loadingStatus }
}
