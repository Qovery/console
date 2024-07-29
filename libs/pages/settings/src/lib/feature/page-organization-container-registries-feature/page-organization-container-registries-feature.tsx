import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import {
  ContainerRegistryCreateEditModal,
  ContainerRegistryServicesListModal,
  useContainerRegistries,
  useDeleteContainerRegistry,
} from '@qovery/domains/organizations/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationContainerRegistries from '../../ui/page-organization-container-registries/page-organization-container-registries'

export function PageOrganizationContainerRegistriesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Container registries - Organization settings')

  const { data: containerRegistries = [], isFetched: isFetchedContainerRegistries } = useContainerRegistries({
    organizationId,
  })
  const { mutateAsync: deleteContainerRegistry } = useDeleteContainerRegistry()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageOrganizationContainerRegistries
      containerRegistries={containerRegistries}
      isFetched={isFetchedContainerRegistries}
      onAddRegistry={() => {
        openModal({
          content: <ContainerRegistryCreateEditModal organizationId={organizationId} onClose={closeModal} />,
          options: {
            fakeModal: true,
          },
        })
      }}
      onEdit={(registry: ContainerRegistryResponse) => {
        openModal({
          content: (
            <ContainerRegistryCreateEditModal
              organizationId={organizationId}
              onClose={closeModal}
              registry={registry}
              isEdit
            />
          ),
          options: {
            fakeModal: true,
          },
        })
      }}
      onDelete={(registry: ContainerRegistryResponse) => {
        openModalConfirmation({
          title: 'Delete container registry',
          isDelete: true,
          name: registry?.name,
          action: async () => {
            try {
              await deleteContainerRegistry({
                organizationId: organizationId,
                containerRegistryId: registry.id,
              })
            } catch (error) {
              console.error(error)
            }
          },
        })
      }}
      onOpenServicesAssociatedModal={(registry: ContainerRegistryResponse) => {
        openModal({
          content: (
            <ContainerRegistryServicesListModal
              organizationId={organizationId}
              containerRegistryId={registry.id}
              onClose={closeModal}
              associatedServicesCount={registry.associated_services_count ?? 0}
            />
          ),
        })
      }}
    />
  )
}

export default PageOrganizationContainerRegistriesFeature
