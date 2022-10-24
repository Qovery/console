import { OrganizationCustomRole } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { deleteCustomRole, fetchCustomRoles, selectOrganizationById } from '@qovery/domains/organization'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const customRolesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.customRoles?.loadingStatus
  )
  const customRoles = organization?.customRoles?.items

  const dispatch = useDispatch<AppDispatch>()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (organization && (!customRolesLoadingStatus || customRolesLoadingStatus === 'not loaded')) {
      dispatch(fetchCustomRoles({ organizationId }))
    }
  }, [organization, customRolesLoadingStatus, dispatch, organizationId, customRoles])

  return (
    <PageOrganizationRoles
      customRoles={customRoles}
      loading={customRolesLoadingStatus || 'not loaded'}
      onAddRole={() => {
        openModal({
          content: <CreateModalFeature organizationId={organizationId} onClose={closeModal} />,
        })
      }}
      onDeleteRole={(customRole: OrganizationCustomRole) => {
        openModalConfirmation({
          title: 'Delete custom role',
          isDelete: true,
          description: 'Are you sure you want to delete this custom role?',
          name: customRole?.name,
          action: () => {
            dispatch(
              deleteCustomRole({
                organizationId: organizationId,
                customRoleId: customRole.id || '',
              })
            )
          },
        })
      }}
    />
  )
}

export default PageOrganizationRolesFeature
