import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@console/shared/utils'
import { OrganizationInterface } from '../interfaces/organization.interface'
import {
  fetchOrganization,
  selectAllOrganization,
  selectOrganizationLoadingStatus,
  postOrganization,
} from '../slices/organization.slice'

export function useOrganization() {
  const { getAccessTokenSilently } = useAuth()
  const dispatch = useDispatch<any>()
  const organization = useSelector(selectAllOrganization)
  const loadingStatus = useSelector(selectOrganizationLoadingStatus)

  const getOrganization = useCallback(async () => dispatch(fetchOrganization()), [dispatch])

  const createOrganization = async (payload: OrganizationInterface) => {
    const result = await dispatch(postOrganization(payload))
    // refresh token needed after created an organization
    await getAccessTokenSilently({ ignoreCache: true })
    return result.payload
  }

  return { organization, loadingStatus, getOrganization, createOrganization }
}
