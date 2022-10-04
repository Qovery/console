import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCustomRoles, selectCustomRoles, selectCustomRolesLoadingStatus } from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const customRoles = useSelector((state: RootState) => selectCustomRoles(state))
  const customRolesLoadingStatus = useSelector((state: RootState) => selectCustomRolesLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (customRolesLoadingStatus !== 'loaded') dispatch(fetchCustomRoles({ organizationId }))
  }, [dispatch, customRolesLoadingStatus, organizationId])

  return <PageOrganizationRoles customRoles={customRoles} />
}

export default PageOrganizationRolesFeature
