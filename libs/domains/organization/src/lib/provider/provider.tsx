import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { OrganizationInterface } from '../interfaces/organization.interface'
import {
  fetchOrganization,
  selectAllOrganization,
  selectOrganizationLoadingStatus,
  postOrganization,
} from '../slices/organization.slice'

export function useOrganization() {
  const dispatch = useDispatch<any>()
  const organization = useSelector(selectAllOrganization)
  const loadingStatus = useSelector(selectOrganizationLoadingStatus)

  const getOrganization = useCallback(() => dispatch(fetchOrganization()), [dispatch])
  const createOrganization = async (payload: OrganizationInterface) => {
    const result = await dispatch(postOrganization(payload))
    return result.payload
  }

  return { organization, loadingStatus, getOrganization, createOrganization }
}
