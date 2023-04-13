import { ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteOrganizationContainerRegistry,
  fetchOrganizationContainerRegistries,
  selectOrganizationById,
} from '@qovery/domains/organization'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationApi from '../../ui/page-organization-api/page-organization-api'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageOrganizationApiFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('API - Organization settings')

  const dispatch = useDispatch<AppDispatch>()
  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const containerRegistriesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.containerRegistries?.loadingStatus
  )

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (organization && containerRegistriesLoadingStatus !== 'loaded')
      dispatch(fetchOrganizationContainerRegistries({ organizationId }))
  }, [dispatch, organizationId, organization, containerRegistriesLoadingStatus])

  return (
    <PageOrganizationApi
      containerRegistries={organization?.containerRegistries?.items}
      loading={containerRegistriesLoadingStatus || 'not loaded'}
      onAddRegistry={() => {
        openModal({ content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} /> })
      }}
      onEdit={(registry: ContainerRegistryResponse) => {
        openModal({
          content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} registry={registry} />,
        })
      }}
      onDelete={(registry: ContainerRegistryResponse) => {
        openModalConfirmation({
          title: 'Delete container registry',
          isDelete: true,
          description: 'Are you sure you want to delete this container registry?',
          name: registry?.name,
          action: () => {
            dispatch(
              deleteOrganizationContainerRegistry({
                organizationId: organizationId,
                containerRegistryId: registry.id,
              })
            )
          },
        })
      }}
    />
  )
}

export default PageOrganizationApiFeature
