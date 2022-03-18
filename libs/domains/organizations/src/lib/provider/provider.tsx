import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { OrganizationInterface } from '../interfaces/organizations.interface'
import {
  fetchOrganizations,
  selectAllOrganizations,
  selectOrganizationsLoadingStatus,
  postOrganization,
} from '../slices/organizations.slice'

export function useOrganizations() {
  const dispatch = useDispatch()
  const organizations = useSelector(selectAllOrganizations)
  const loadingStatus = useSelector(selectOrganizationsLoadingStatus)

  const getOrganizations = useCallback(() => dispatch(fetchOrganizations()), [dispatch])
  const createOrganization = (payload: OrganizationInterface) => dispatch(postOrganization(payload))

  return { organizations, loadingStatus, getOrganizations, createOrganization }
}
