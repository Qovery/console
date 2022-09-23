import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchOrganizationContainerRegistries, selectOrganizationById } from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationContainerRegistries from '../../ui/page-organization-container-registries/page-organization-container-registries'

export function PageOrganizationContainerRegistriesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Organization settings - Container registries')

  const dispatch = useDispatch<AppDispatch>()
  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const containerRegistriesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.containerRegistries?.loadingStatus
  )

  useEffect(() => {
    if (organization && containerRegistriesLoadingStatus !== 'loaded')
      dispatch(fetchOrganizationContainerRegistries({ organizationId }))
  }, [dispatch, organizationId, organization, containerRegistriesLoadingStatus])

  // console.log(organization)

  return (
    <PageOrganizationContainerRegistries
      containerRegistries={organization?.containerRegistries?.items}
      loading={containerRegistriesLoadingStatus || 'not loaded'}
    />
  )
}

export default PageOrganizationContainerRegistriesFeature
