import { OrganizationApiToken } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { deleteApiToken, fetchApiTokens, selectOrganizationById } from '@qovery/domains/organization'
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

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (
      organization &&
      (!organization.apiTokens?.loadingStatus || organization.apiTokens.loadingStatus === 'not loaded')
    )
      dispatch(fetchApiTokens({ organizationId }))
  }, [dispatch, organizationId, organization, organization?.apiTokens?.loadingStatus])

  return (
    <PageOrganizationApi
      apiTokens={organization?.apiTokens?.items}
      loading={organization?.apiTokens?.loadingStatus || 'not loaded'}
      onAddToken={() => {
        openModal({ content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} /> })
      }}
      onDelete={(token: OrganizationApiToken) => {
        openModalConfirmation({
          title: 'Delete API token',
          isDelete: true,
          description: 'Are you sure you want to delete this token?',
          name: token?.name,
          action: () => {
            dispatch(
              deleteApiToken({
                organizationId: organizationId,
                apiTokenId: token.id,
              })
            )
          },
        })
      }}
    />
  )
}

export default PageOrganizationApiFeature
