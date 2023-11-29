import { type HelmRepositoryResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useDeleteHelmRepository, useHelmRepositories } from '@qovery/domains/organizations/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PageOrganizationHelmRepositories } from '../../ui/page-organization-helm-repositories/page-organization-helm-repositories'
import { CrudModalFeature } from './crud-modal-feature/crud-modal-feature'

export function PageOrganizationHelmRepositoriesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Helm repositories - Organization settings')

  const { data: helmRepositories = [], isFetched: isFetchedHelmRepositories } = useHelmRepositories({
    organizationId,
  })
  const { mutateAsync: deleteHelmRepository } = useDeleteHelmRepository()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageOrganizationHelmRepositories
      helmRepositories={helmRepositories}
      isFetched={isFetchedHelmRepositories}
      onAddRepository={() => {
        openModal({ content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} /> })
      }}
      onEdit={(repository: HelmRepositoryResponse) => {
        openModal({
          content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} repository={repository} />,
        })
      }}
      onDelete={(repository: HelmRepositoryResponse) => {
        openModalConfirmation({
          title: 'Delete helm repository',
          isDelete: true,
          name: repository?.name,
          action: async () => {
            try {
              await deleteHelmRepository({
                organizationId: organizationId,
                helmRepositoryId: repository.id,
              })
            } catch (error) {
              console.error(error)
            }
          },
        })
      }}
    />
  )
}

export default PageOrganizationHelmRepositoriesFeature
