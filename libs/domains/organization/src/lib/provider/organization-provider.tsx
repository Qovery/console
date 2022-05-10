import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { OrganizationRequest } from 'qovery-typescript-axios'
import { useAuth } from '@console/shared/utils'
import {
  fetchOrganization,
  postOrganization,
  selectAllOrganization,
  selectOrganizationLoadingStatus,
} from '../slices/organization.slice'

export function useOrganization() {
  const { getAccessTokenSilently } = useAuth()
  const dispatch = useDispatch<any>()
  const organization = useSelector(selectAllOrganization)
  const loadingStatus = useSelector(selectOrganizationLoadingStatus)

  const getOrganization = useCallback(async () => dispatch(fetchOrganization()), [dispatch])

  const createOrganization = async (payload: OrganizationRequest) => {
    const result = await dispatch(postOrganization(payload))
    // refresh token needed after created an organization
    await getAccessTokenSilently({ ignoreCache: true })
    return result.payload
  }

  return { organization, loadingStatus, getOrganization, createOrganization }
}
