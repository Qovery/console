import { type OrganizationApiToken } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useApiTokens, useDeleteApiToken } from '@qovery/domains/organizations/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationApi from '../../ui/page-organization-api/page-organization-api'
import CrudModalFeature from './crud-modal-feature/crud-modal-feature'

export function PageOrganizationApiFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('API - Organization settings')

  const { data: apiTokens = [], isFetched: isFetchedApiTokens } = useApiTokens({ organizationId })
  const { mutateAsync: deleteApiToken } = useDeleteApiToken()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageOrganizationApi
      apiTokens={apiTokens}
      isFetched={isFetchedApiTokens}
      onAddToken={() => {
        openModal({ content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} /> })
      }}
      onDelete={(token: OrganizationApiToken) => {
        openModalConfirmation({
          title: 'Delete API token',
          isDelete: true,
          name: token?.name,
          action: () => {
            try {
              deleteApiToken({ organizationId, apiTokenId: token.id })
            } catch (error) {
              console.error(error)
            }
          },
        })
      }}
    />
  )
}

export default PageOrganizationApiFeature
