import { type OrganizationCustomRole } from 'qovery-typescript-axios'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { deleteCustomRole } from '@qovery/domains/organization'
import { useAvailableRoles } from '@qovery/domains/organizations/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch } from '@qovery/state/store'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const {
    data: availableRoles = [],
    isLoading: isLoadingAvailableRoles,
    refetch: refetchAvailableRoles,
  } = useAvailableRoles({ organizationId })

  const dispatch = useDispatch<AppDispatch>()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageOrganizationRoles
      roles={availableRoles}
      loading={isLoadingAvailableRoles}
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
              .unwrap()
              .then(() =>
                // fetch the list of available roles after add new role
                // state update doesn't work need to be refetch because request don't return response
                refetchAvailableRoles()
              )
              .catch((e) => console.error(e))
          },
        })
      }}
    />
  )
}

export default PageOrganizationRolesFeature
