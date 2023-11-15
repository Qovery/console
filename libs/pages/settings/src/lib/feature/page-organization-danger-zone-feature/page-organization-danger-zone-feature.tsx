import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteOrganization, useOrganization } from '@qovery/domains/organizations/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationDangerZone from '../../ui/page-organization-danger-zone/page-organization-danger-zone'

export function PageOrganizationDangerZoneFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('Danger zone - Organization settings')

  const navigate = useNavigate()

  const { data: organization } = useOrganization({ organizationId })
  const { mutateAsync: deleteOrganization, isLoading: isLoadingDeleteOrganization } = useDeleteOrganization()

  const deleteOrganizationAction = async () => {
    try {
      await deleteOrganization({
        organizationId,
      })
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <PageOrganizationDangerZone
      deleteOrganization={deleteOrganizationAction}
      organization={organization}
      loading={isLoadingDeleteOrganization}
    />
  )
}

export default PageOrganizationDangerZoneFeature
