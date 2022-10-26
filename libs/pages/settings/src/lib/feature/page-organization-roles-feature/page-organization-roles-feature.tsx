import { OrganizationCustomRole } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { deleteCustomRole, fetchAvailableRoles, selectOrganizationById } from '@qovery/domains/organization'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const customRolesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.customRoles?.loadingStatus
  )

  const availableRolesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.availableRoles?.loadingStatus
  )
  const availableRoles = organization?.availableRoles?.items || []

  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (organization && (!availableRolesLoadingStatus || availableRolesLoadingStatus === 'not loaded')) {
      setLoading(true)

      dispatch(fetchAvailableRoles({ organizationId }))
        .unwrap()
        .finally(() => setLoading(false))
    }
  }, [organization, customRolesLoadingStatus, dispatch, organizationId, availableRolesLoadingStatus])

  return (
    <PageOrganizationRoles
      roles={availableRoles}
      loading={loading}
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
