import { type OrganizationCustomRole } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useAvailableRoles, useDeleteCustomRole } from '@qovery/domains/organizations/feature'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const { data: availableRoles = [], isLoading: isLoadingAvailableRoles } = useAvailableRoles({ organizationId })
  const { mutateAsync: deleteCustomRole } = useDeleteCustomRole()

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
          action: async () => {
            try {
              await deleteCustomRole({
                organizationId: organizationId,
                customRoleId: customRole.id ?? '',
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

export default PageOrganizationRolesFeature
